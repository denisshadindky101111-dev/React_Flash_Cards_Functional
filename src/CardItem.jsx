import React from 'react';

const CardItem = ({ card, onLearned, onDelete, onEdit }) => {
  console.log(`Рендер карточки: ${card.id}`);

  return (
    <div className={`card-item ${card.learned ? 'is-learned' : ''}`}>
      <div className="card-content">
        <p className="card-front"><strong>Question:</strong> {card.front}</p>
        <p className="card-back"><strong>Answer:</strong> {card.back}</p>
      </div>

      <div className="card-actions">
        <button onClick={() => onLearned(card.id)}>
          {card.learned ? 'Reset' : 'Learned'}
        </button>

        {onEdit && (
          <button onClick={() => onEdit(card)}>
            Edit
          </button>
        )}

        <button onClick={() => onDelete(card.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default React.memo(CardItem);
