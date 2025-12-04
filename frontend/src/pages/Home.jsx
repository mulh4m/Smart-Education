import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import CourseShowcase from '../components/CourseShowcase';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="home-page" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header />
      <Hero />
      <CourseShowcase />
      <About />
      <Footer />
    </div>
  );
};

export default Home;

