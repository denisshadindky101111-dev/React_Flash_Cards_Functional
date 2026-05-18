export default function CreateDeckForm({ name, onNameChange, onCreate }) {
  return (
    <div className="panel">
      <strong>Новая колода: </strong>
      <input
        type="text"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Название..."
      />
      <input type="button" value="Создать" onClick={onCreate} />
    </div>
  );
}
