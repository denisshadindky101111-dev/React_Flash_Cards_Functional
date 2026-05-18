import CardItem from "./CardItem";

export default function CardList({
  currentDeck,
  editingCardId,
  editFront,
  editBack,
  onLearned,
  onDelete,
  onEdit,
  onEditFrontChange,
  onEditBackChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="panel">
      <h3>Список карточек в колоде:</h3>
      {!currentDeck ? (
        <div className="empty-hint">Выберите колоду, чтобы увидеть карточки</div>
      ) : (
        <div>
          <div>Всего: {currentDeck.cards.length}</div>
          {currentDeck.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onLearned={onLearned}
              onDelete={onDelete}
              onEdit={onEdit}
              isEditing={editingCardId === card.id}
              editFront={editFront}
              editBack={editBack}
              onEditFrontChange={onEditFrontChange}
              onEditBackChange={onEditBackChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
