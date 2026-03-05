import { Link } from 'react-router-dom';

type BrandLogoProps = {
  className?: string;
  iconWrapperClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  to?: string;
};

export default function BrandLogo({
  className = 'flex items-center gap-2',
  iconWrapperClassName = 'w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20',
  iconClassName = 'material-icons text-white text-2xl',
  textClassName = 'text-xl font-bold tracking-tight text-slate-900',
  to = '/',
}: BrandLogoProps) {
  return (
    <Link to={to} className={className} aria-label="Go to homepage">
      <div className={iconWrapperClassName}>
        <span className={iconClassName}>psychology</span>
      </div>
      <span className={textClassName}>EchoMind</span>
    </Link>
  );
}
