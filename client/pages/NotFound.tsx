import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-9xl font-bold text-primary mb-4">404</div>
          <h1 className="text-4xl font-bold mb-2">Страница не найдена</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Похоже, эта страница еще готовится. Свяжитесь с нами в чате, если вы хотите, чтобы мы добавили эту функцию!
          </p>
          <Link
            to="/"
            className="inline-block btn-primary text-lg"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
