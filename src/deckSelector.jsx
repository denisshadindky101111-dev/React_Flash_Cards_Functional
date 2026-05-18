export default function DeckSelector({
  decks,
  selectedDeckNumber,
  onSelectDeck,
  onDeleteDeck,
}) {
  return (
    <div className="panel">
      <strong>Выбор колоды: </strong>
      <select
        value={selectedDeckNumber ?? ""}
        onChange={(event) => {
          const nextValue = event.target.value;
          onSelectDeck(nextValue ? Number(nextValue) : null);
        }}
      >
        <option value="">-- не выбрано --</option>
        {decks.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.name}
          </option>
        ))}
      </select>
      <input type="button" value="Удалить колоду" onClick={onDeleteDeck} />
    </div>
  );
}
