export function LogoCartaz({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const fontSize = size === 'sm' ? '1.125rem' : '1.375rem';
  const star = size === 'sm' ? 16 : 20;
  return (
    <span className="logo-cartaz" style={{ fontSize }}>
      <svg width={star} height={star} viewBox="0 0 30 30" aria-hidden>
        <polygon
          points="15,2 18.5,11 28,11 20.5,17 24,26 15,20.5 6,26 9.5,17 2,11 11.5,11"
          fill="#fff"
        />
      </svg>
      Voto Vizinho
    </span>
  );
}
