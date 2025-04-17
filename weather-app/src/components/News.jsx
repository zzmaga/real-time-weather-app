import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiKey = 'YOUR_NEWSAPI_KEY'; // Replace with your NewsAPI key

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=weather+OR+disaster+kazakhstan+OR+central+asia&language=ru&sortBy=publishedAt&apiKey=${apiKey}`
        );
        setNews(response.data.articles.slice(0, 20)); // Limit to 20 articles
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        setNews([
          {
            title: 'Пример новости: Пожар в Шымкенте',
            description: 'Лесной пожар произошел недалеко от Шымкента, власти принимают меры.',
            url: '#',
            publishedAt: new Date().toISOString(),
          },
          {
            title: 'Пример новости: Землетрясение в Алматы',
            description: 'Небольшое землетрясение зафиксировано в Алматы, жертв нет.',
            url: '#',
            publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="section">
      <h2>Новости о погоде и катастрофах</h2>
      {loading ? (
        <p>Загрузка новостей...</p>
      ) : (
        <div className="news-list">
          {news.length ? (
            <ul>
              {news.map((article, index) => (
                <li key={index} className="news-item">
                  <h3>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  <p>{article.description || 'Описание отсутствует'}</p>
                  <p className="news-date">
                    Опубликовано: {new Date(article.publishedAt).toLocaleString('ru-RU')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Новости не найдены.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default News;