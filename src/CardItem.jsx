import React from "react";

const CardItem = ({
  card,
  onLearned,
  onDelete,
  onEdit,
  isEditing,
  editFront,
  editBack,
  onEditFrontChange,
  onEditBackChange,
  onSave,
  onCancel,
}) => {
  if (isEditing) {
    return (
      <div className={`card-item ${card.learned ? "is-learned" : ""}`}>
        <div className="card-content">
          <input
            type="text"
            value={editFront}
            onChange={(event) => onEditFrontChange(event.target.value)}
            placeholder="Вопрос (лицо)"
          />
          <input
            type="text"
            value={editBack}
            onChange={(event) => onEditBackChange(event.target.value)}
            placeholder="Ответ (оборот)"
          />
        </div>
        <div className="card-actions">
          <button type="button" onClick={onSave}>
            Сохранить
          </button>
          <button type="button" onClick={onCancel}>
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-item ${card.learned ? "is-learned" : ""}`}>
      <div className="card-content">
        <p className="card-front">
          <strong>Вопрос:</strong> {card.front}
        </p>
        <p className="card-back">
          <strong>Ответ:</strong> {card.back}
        </p>
      </div>

      <div className="card-actions">
        <button type="button" onClick={() => onLearned(card.id)}>
          {card.learned ? "Сбросить" : "Выучено"}
        </button>

        {onEdit && (
          <button type="button" onClick={() => onEdit(card)}>
            Изменить
          </button>
        )}

        <button type="button" onClick={() => onDelete(card.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
};

export default React.memo(CardItem);
