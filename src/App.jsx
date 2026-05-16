import { useCallback, useEffect, useState } from "react";
import "./App.css";
import StudyMode from "./StudyMode";
import CardItem from "./CardItem";

const createId = () => Date.now() + Math.random();

export default function App() {
  const [decks, setDecks] = useState([]);
  const [selectedDeckNumber, setSelectedDeckNumber] = useState(null);
  const [studyMode, setStudyMode] = useState(false);
  const [studyCards, setStudyCards] = useState([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [showFront, setShowFront] = useState(true);
  const [newDeckName, setNewDeckName] = useState("");
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("flashcards-app-data");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setDecks(parsed);
          setSelectedDeckNumber(parsed.length > 0 ? parsed[0].id : null);
        }
      } catch (error) {
        console.error("Failed to parse localStorage data:", error);
      }
      return;
    }

    const decodeHtml = (text) => {
      const parser = new DOMParser();
      return parser.parseFromString(text, "text/html").documentElement.textContent ?? text;
    };

    const loadFromApi = async () => {
      try {
        const response = await fetch("https://opentdb.com/api.php?amount=50");
        if (!response.ok) {
          throw new Error(`OpenTDB request failed: ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data.results) ? data.results : [];

        const generatedDeck = {
          id: createId(),
          name: "Open Trivia DB",
          cards: results.map((item) => ({
            id: createId(),
            front: decodeHtml(item.question ?? "Question"),
            back: decodeHtml(item.correct_answer ?? "Answer"),
            learned: false,
          })),
        };

        setDecks(generatedDeck.cards.length > 0 ? [generatedDeck] : []);
        setSelectedDeckNumber(generatedDeck.cards.length > 0 ? generatedDeck.id : null);
      } catch (error) {
        console.error("Failed to load trivia cards:", error);
      }
    };

    loadFromApi();
  }, []);

  useEffect(() => {
    localStorage.setItem("flashcards-app-data", JSON.stringify(decks));
  }, [decks]);

  const createDeck = () => {
    const name = newDeckName.trim();
    if (!name) return;

    const newDeck = {
      id: createId(),
      name,
      cards: [],
    };

    setDecks((prev) => [...prev, newDeck]);
    setSelectedDeckNumber(newDeck.id);
    setNewDeckName("");
  };

  const deleteDeck = () => {
    const id = selectedDeckNumber;
    if (!id) return;

    setDecks((prev) => {
      const filtered = prev.filter((deck) => deck.id !== id);
      setSelectedDeckNumber(filtered.length > 0 ? filtered[0].id : null);
      return filtered;
    });

    setStudyMode(false);
    setEditingCardId(null);
    setEditFront("");
    setEditBack("");
  };

  const deleteCard = useCallback((cardId) => {
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === selectedDeckNumber
          ? { ...deck, cards: deck.cards.filter((card) => card.id !== cardId) }
          : deck
      )
    );

    if (editingCardId === cardId) {
      setEditingCardId(null);
      setEditFront("");
      setEditBack("");
    }
  }, [selectedDeckNumber, editingCardId]);

  const createCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim() || !selectedDeckNumber) return;

    const newCard = {
      id: createId(),
      front: newCardFront,
      back: newCardBack,
      learned: false,
    };

    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === selectedDeckNumber
          ? { ...deck, cards: [...deck.cards, newCard] }
          : deck
      )
    );

    setNewCardFront("");
    setNewCardBack("");
  };

  const toggleLearned = useCallback((cardId) => {
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === selectedDeckNumber
          ? {
              ...deck,
              cards: deck.cards.map((card) =>
                card.id === cardId ? { ...card, learned: !card.learned } : card
              ),
            }
          : deck
      )
    );

    setStudyCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, learned: !card.learned } : card
      )
    );
  }, [selectedDeckNumber]);

  const startStudy = () => {
    const current = decks.find((deck) => deck.id === selectedDeckNumber);
    if (!current || current.cards.length === 0) return;

    const shuffled = [...current.cards].sort(() => Math.random() - 0.5);

    setStudyMode(true);
    setStudyCards(shuffled);
    setStudyIndex(0);
    setShowFront(true);
  };

  const studyFlip = () => setShowFront((prev) => !prev);

  const studyNext = () => {
    setStudyIndex((prev) => (prev + 1) % studyCards.length);
    setShowFront(true);
  };

  const studyPrev = () => {
    setStudyIndex((prev) => (prev - 1 + studyCards.length) % studyCards.length);
    setShowFront(true);
  };

  const studyMark = () => {
    const card = studyCards[studyIndex];
    if (!card) return;
    toggleLearned(card.id);
  };

  const startEditCard = (card) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditFront("");
    setEditBack("");
  };

  const saveEdit = useCallback(() => {
    const front = editFront.trim();
    const back = editBack.trim();
    if (front === "" || back === "") return;

    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === selectedDeckNumber
          ? {
              ...deck,
              cards: deck.cards.map((card) =>
                card.id === editingCardId ? { ...card, front, back } : card
              ),
            }
          : deck
      )
    );

    setEditingCardId(null);
    setEditFront("");
    setEditBack("");
  }, [editFront, editBack, selectedDeckNumber, editingCardId]);

  const currentDeck = decks.find((deck) => deck.id === selectedDeckNumber);

  return (
    <div className="App">
      <h1>Мои Карточки</h1>

      {studyMode ? (
        <StudyMode
          currentCard={studyCards[studyIndex]}
          showFront={showFront}
          flipCard={studyFlip}
          nextCard={studyNext}
          prevCard={studyPrev}
          finishStudy={() => setStudyMode(false)}
          markCurrentCardAsLearned={studyMark}
        />
      ) : (
        <div className="main-screen">
          <div className="panel">
            <strong>Новая колода: </strong>
            <input
              type="text"
              value={newDeckName}
              onChange={(event) => setNewDeckName(event.target.value)}
              placeholder="Название..."
            />
            <input type="button" value="Создать" onClick={createDeck} />
          </div>

          <div className="panel">
            <strong>Выбор колоды: </strong>
            <select
              value={selectedDeckNumber ?? ""}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSelectedDeckNumber(nextValue ? Number(nextValue) : null);
                setEditingCardId(null);
                setEditFront("");
                setEditBack("");
              }}
            >
              <option value="">-- не выбрано --</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
            <input type="button" value="Удалить колоду" onClick={deleteDeck} />
          </div>

          <hr />

          <div className="panel">
            <h3>Добавить карточку</h3>
            <input
              type="text"
              value={newCardFront}
              onChange={(event) => setNewCardFront(event.target.value)}
              placeholder="Вопрос (лицо)"
            />
            <input
              type="text"
              value={newCardBack}
              onChange={(event) => setNewCardBack(event.target.value)}
              placeholder="Ответ (оборот)"
            />
            <input type="button" value="Добавить" onClick={createCard} />
          </div>

          <hr />

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
                    onLearned={toggleLearned}
                    onDelete={deleteCard}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="start-test-wrap">
            <input
              type="button"
              className="start-test"
              value="НАЧАТЬ ТЕСТ"
              onClick={startStudy}
              disabled={!currentDeck || currentDeck.cards.length === 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
