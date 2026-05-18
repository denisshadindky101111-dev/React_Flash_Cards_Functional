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
        value={selectedDeckNumber != null ? String(selectedDeckNumber) : ""}
        onChange={(event) => {
          const nextValue = event.target.value;
          onSelectDeck(nextValue || null);
        }}
      >
        <option value="">-- не выбрано --</option>
        {decks.map((deck) => (
          <option key={deck.id} value={String(deck.id)}>
            {deck.name}
          </option>
        ))}
      </select>
      <input type="button" value="Удалить колоду" onClick={onDeleteDeck} />
    </div>
  );
}
