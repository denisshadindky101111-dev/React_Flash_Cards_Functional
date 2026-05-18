export default function AddCardForm({ front, back, onFrontChange, onBackChange, onAdd }) {
  return (
    <div className="panel">
      <h3>Добавить карточку</h3>
      <input
        type="text"
        value={front}
        onChange={(event) => onFrontChange(event.target.value)}
        placeholder="Вопрос (лицо)"
      />
      <input
        type="text"
        value={back}
        onChange={(event) => onBackChange(event.target.value)}
        placeholder="Ответ (оборот)"
      />
      <input type="button" value="Добавить" onClick={onAdd} />
    </div>
  );
}
