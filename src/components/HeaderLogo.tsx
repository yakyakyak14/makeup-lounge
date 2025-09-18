import { useNavigate } from "react-router-dom";

const HeaderLogo = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      className="flex items-center gap-2 group"
      aria-label="Make-Up Lounge Home"
    >
      <img
        src={import.meta.env.BASE_URL + 'logo.png'}
        alt="Make-Up Lounge — Beauty & Makeup Booking Platform"
        title="Make-Up Lounge — Book Professional Makeup Artists Online"
        className="h-8 w-auto select-none"
      />
      <span className="font-playfair text-lg font-bold text-primary group-hover:opacity-80">
        Make-Up Lounge
      </span>
    </button>
  );
};

export default HeaderLogo;
