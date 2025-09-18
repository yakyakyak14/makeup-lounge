import { useLocation } from 'react-router-dom';
import { SEO } from './SEO';
import { getKeywords } from './keywords';

const titles: Record<string, string> = {
  '/': 'Make-Up Lounge | Professional Beauty & Makeup Services | Book Online',
  '/browse': 'Discover Makeup Artists | Browse Beauty Services — Make-Up Lounge',
  '/bookings': 'Manage Makeup Bookings | Appointments — Make-Up Lounge',
  '/messages': 'Chat & Negotiate with Artists — Make-Up Lounge',
  '/services': 'Beauty & Makeup Services | Pricing — Make-Up Lounge',
  '/profile': 'Profile & Portfolio — Make-Up Lounge',
  '/ratings': 'Artist Ratings & Reviews — Make-Up Lounge',
  '/dashboard': 'Dashboard — Make-Up Lounge',
  '/settings': 'Settings — Make-Up Lounge',
  '/help': 'Help & Support — Make-Up Lounge',
};

const descriptions: Record<string, string> = {
  '/': 'Book professional makeup artists for weddings, events, and photoshoots. Secure online booking 24/7 with verified artists.',
  '/browse': 'Discover talented makeup artists near you. Compare services, prices, and ratings on Make-Up Lounge.',
  '/bookings': 'Manage your beauty appointments easily. Reschedule, track status, and complete secure payments.',
  '/messages': 'Chat with artists to negotiate prices and discuss looks before booking. Seamless messaging in-app.',
  '/services': 'Explore makeup and beauty service packages including bridal glam, event looks, and photoshoot makeup.',
  '/profile': 'Showcase your portfolio and reviews. Clients can view your work and book instantly.',
  '/ratings': 'See real reviews and ratings from verified clients to choose the best artist for your event.',
  '/dashboard': 'Get a snapshot of your bookings, messages, and performance on the dashboard.',
  '/settings': 'Manage account, notifications, and preferences.',
  '/help': 'Get help, FAQs, and support for Make-Up Lounge.',
};

export const RouteSEO = () => {
  const { pathname } = useLocation();
  const key = pathname.replace(/\/$/, '') || '/';
  const title = titles[key] || titles['/'];
  const description = descriptions[key] || descriptions['/'];
  const keywords = getKeywords(key);

  return (
    <SEO
      title={title}
      description={description}
      keywords={keywords}
      canonicalPath={pathname}
      image={'/logo.png'}
    />
  );
};

export default RouteSEO;
