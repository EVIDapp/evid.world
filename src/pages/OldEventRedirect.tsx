import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoricalEvent } from '@/types/event';
import { getEventSlugOnly, categorySlugMap } from '@/utils/slugify';

// Компонент для редиректа со старых URL (/event/:slug) на новые (/category/:category/:slug)
const OldEventRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToNewUrl = async () => {
      try {
        const response = await fetch('/events.json');
        const events: HistoricalEvent[] = await response.json();
        
        // Найти событие по старому слагу
        const foundEvent = events.find(e => {
          const eventSlug = getEventSlugOnly(e.title, e.year);
          return eventSlug === slug || e.id === slug;
        });
        
        if (foundEvent) {
          // Получить слаг категории
          const categorySlug = categorySlugMap[foundEvent.type] || foundEvent.type;
          const eventSlug = getEventSlugOnly(foundEvent.title, foundEvent.year);
          
          // Редирект на новый URL
          navigate(`/category/${categorySlug}/${eventSlug}`, { replace: true });
        } else {
          // Если событие не найдено, редирект на 404
          navigate('/404', { replace: true });
        }
      } catch (error) {
        console.error('Error redirecting:', error);
        navigate('/404', { replace: true });
      }
    };

    if (slug) {
      redirectToNewUrl();
    }
  }, [slug, navigate]);

  // Показываем индикатор загрузки
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default OldEventRedirect;
