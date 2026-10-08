#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera public/data/locais/{UF}.json a partir dos CSVs do TSE (bweb + eleitorado).

Uso (a partir da raiz do repo voto-vizinho):

  python3 scripts/gerar_locais_por_uf.py

Variavel de ambiente DADOS_TSE aponta para a pasta votovizinho.
"""
from __future__ import annotations

import csv
import json
import os
import sys
from collections import defaultdict
from pathlib import Path

NR_LULA = "13"
NR_FLAVIO = "22"

REPO = Path(__file__).resolve().parent.parent
DADOS = Path(os.environ.get("DADOS_TSE", REPO.parent / "votovizinho"))
OUT_DIR = REPO / "public" / "data" / "locais"


def norm_cd(value: str) -> str:
    return str(int(value))


def ler_csv(caminho: Path):
    with caminho.open(encoding="latin1") as f:
        yield from csv.DictReader(f, delimiter=";")


def caminho_bweb(uf: str) -> Path | None:
    base = DADOS / "dados_tse_2026_zip"
    matches = list(base.glob(f"bweb_1t_{uf}_*/*.csv"))
    return matches[0] if matches else None


def caminho_eleitorado(uf: str) -> Path:
    return DADOS / "eleitorado_local_votacao_2026" / f"eleitorado_local_votacao_2026_{uf}.csv"


def extrair_uf(uf: str) -> list[dict]:
    bweb = caminho_bweb(uf)
    locais_csv = caminho_eleitorado(uf)
    if not bweb or not bweb.is_file():
        raise FileNotFoundError(f"bweb not found for {uf}")
    if not locais_csv.is_file():
        raise FileNotFoundError(f"eleitorado not found for {uf}")

    locais: dict[tuple[str, str, str], dict] = {}
    for row in ler_csv(locais_csv):
        chave = (norm_cd(row["CD_MUNICIPIO"]), row["NR_ZONA"], row["NR_LOCAL_VOTACAO"])
        if chave in locais:
            continue
        try:
            lat = float(row["NR_LATITUDE"].replace(",", "."))
            lng = float(row["NR_LONGITUDE"].replace(",", "."))
        except ValueError:
            continue
        if lat == -1:
            continue
        locais[chave] = {
            "uf": row["SG_UF"],
            "municipio": row["NM_MUNICIPIO"].title(),
            "nome": row["NM_LOCAL_VOTACAO"].title(),
            "endereco": row["DS_ENDERECO"].title(),
            "bairro": row["NM_BAIRRO"].title(),
            "cep": row["NR_CEP"],
            "lat": lat,
            "lng": lng,
        }

    votos: dict[tuple[str, str, str], dict] = defaultdict(
        lambda: {
            "lula": 0,
            "flavio": 0,
            "outros": 0,
            "brancos": 0,
            "nulos": 0,
            "aptos": 0,
            "abstencoes": 0,
        }
    )
    secoes_vistas: set[tuple[tuple[str, str, str], str]] = set()

    for row in ler_csv(bweb):
        if row["DS_CARGO_PERGUNTA"] != "Presidente":
            continue
        chave = (norm_cd(row["CD_MUNICIPIO"]), row["NR_ZONA"], row["NR_LOCAL_VOTACAO"])
        secao = (chave, row["NR_SECAO"])
        v = votos[chave]
        if secao not in secoes_vistas:
            secoes_vistas.add(secao)
            v["aptos"] += int(row["QT_APTOS"])
            v["abstencoes"] += int(row["QT_ABSTENCOES"])
        qt = int(row["QT_VOTOS"])
        tipo = row["DS_TIPO_VOTAVEL"]
        if tipo == "Branco":
            v["brancos"] += qt
        elif tipo == "Nominal" and row["NR_VOTAVEL"] == NR_LULA:
            v["lula"] += qt
        elif tipo == "Nominal" and row["NR_VOTAVEL"] == NR_FLAVIO:
            v["flavio"] += qt
        elif tipo in ("Nominal", "Legenda"):
            v["outros"] += qt
        else:
            v["nulos"] += qt

    saida: list[dict] = []
    for chave, v in votos.items():
        local = locais.get(chave)
        if not local:
            continue
        cd, zona, local_nr = chave
        saida.append(
            {
                "id": f"{uf}-{cd}-{zona}-{local_nr}",
                **local,
                **v,
            }
        )
    return saida


def bounds_de_locais(locais: list[dict]) -> dict[str, float]:
    lats = [x["lat"] for x in locais]
    lngs = [x["lng"] for x in locais]
    return {
        "south": min(lats),
        "north": max(lats),
        "west": min(lngs),
        "east": max(lngs),
    }


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    prefix = "eleitorado_local_votacao_2026_"
    ufs = sorted(
        p.stem.removeprefix(prefix)
        for p in (DADOS / "eleitorado_local_votacao_2026").glob(f"{prefix}*.csv")
        if p.stem not in (f"{prefix}BRASIL", f"{prefix}ZZ")
    )

    index: dict = {"ufs": [], "bounds": {}, "exemplo": None}
    total = 0

    for uf in ufs:
        if caminho_bweb(uf) is None:
            print(f"[skip] {uf}: sem bweb", file=sys.stderr)
            continue
        print(f"Processing {uf}...", flush=True)
        locais = extrair_uf(uf)
        path = OUT_DIR / f"{uf}.json"
        path.write_text(json.dumps(locais, ensure_ascii=False), encoding="utf-8")
        total += len(locais)
        index["ufs"].append(uf)
        index["bounds"][uf] = bounds_de_locais(locais)
        print(f"  {len(locais)} locais -> {path.name}")
        if index["exemplo"] is None:
            for loc in locais:
                if loc["lula"] > loc["flavio"]:
                    index["exemplo"] = {
                        "id": loc["id"],
                        "lat": loc["lat"],
                        "lng": loc["lng"],
                        "rotulo": f"{loc['nome']} - {loc['municipio']}/{loc['uf']}",
                    }
                    break

    (OUT_DIR / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Done: {total} locais in {len(index['ufs'])} UFs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
