export default function StudyMode({
  currentCard,
  showFront,
  flipCard,
  nextCard,
  prevCard,
  finishStudy,
  markCurrentCardAsLearned,
}) {
  if (!currentCard) {
    return (
      <div className="study-mode">
        <h2>Режим изучения</h2>
        <p>Карточки не найдены.</p>
        <button type="button" onClick={finishStudy}>
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="study-mode">
      <h2>Режим изучения</h2>

      <div className="study-card">
        <p>{showFront ? currentCard.front : currentCard.back}</p>
      </div>

      <div className="study-actions">
        <button type="button" onClick={prevCard}>
          Предыдущая
        </button>
        <button type="button" onClick={flipCard}>
          Перевернуть
        </button>
        <button type="button" onClick={nextCard}>
          Следующая
        </button>
      </div>

      <div className="study-actions">
        <button type="button" onClick={markCurrentCardAsLearned}>
          Выучено
        </button>
        <button type="button" onClick={finishStudy}>
          Завершить
        </button>
      </div>
    </div>
  );
}
