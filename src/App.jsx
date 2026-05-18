import { useCallback, useEffect, useState } from "react";
import "./App.css";
import StudyMode from "./StudyMode";
import CardItem from "./CardItem";
import DeckSelector from "./deckSelector";

const createId = () => Date.now() + Math.random();
const API_DECK_NAME = "Викторина из интернета";

const fixText = (text) => {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html").documentElement.textContent ?? text;
};

const loadApiDeck = async () => {
  const response = await fetch("https://opentdb.com/api.php?amount=50");
  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  const data = await response.json();
  const questions = Array.isArray(data.results) ? data.results : [];

  return {
    id: createId(),
    name: API_DECK_NAME,
    cards: questions.map((item) => ({
      id: createId(),
      front: fixText(item.question ?? "Вопрос"),
      back: fixText(item.correct_answer ?? "Ответ"),
      learned: false,
    })),
  };
};

export default function App() {
  const [decks, setDecks] = useState([]);
  const [canSave, setCanSave] = useState(false);
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
    const start = async () => {
      let decksList = [];

      const saved = localStorage.getItem("flashcards-app-data");
      if (saved) {
        try {
          const savedDecks = JSON.parse(saved);
          if (Array.isArray(savedDecks)) {
            decksList = savedDecks;
          }
        } catch (error) {
          console.error("Не удалось прочитать сохранённые колоды:", error);
        }
      }

      const apiDeckExists = decksList.some(
        (deck) => deck.name === API_DECK_NAME || deck.name === "Open Trivia DB"
      );

      if (!apiDeckExists) {
        try {
          const apiDeck = await loadApiDeck();
          if (apiDeck.cards.length > 0) {
            decksList = [...decksList, apiDeck];
          }
        } catch (error) {
          console.error("Не удалось загрузить колоду с сайта:", error);
        }
      }

      setDecks(decksList);
      setSelectedDeckNumber(decksList.length > 0 ? decksList[0].id : null);
      setCanSave(true);
    };

    start();
  }, []);

  useEffect(() => {
    if (!canSave) return;
    localStorage.setItem("flashcards-app-data", JSON.stringify(decks));
  }, [decks, canSave]);

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

  const selectDeck = (deckId) => {
    setSelectedDeckNumber(deckId);
    setEditingCardId(null);
    setEditFront("");
    setEditBack("");
  };

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

          <DeckSelector
            decks={decks}
            selectedDeckNumber={selectedDeckNumber}
            onSelectDeck={selectDeck}
            onDeleteDeck={deleteDeck}
          />

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
                    onEdit={startEditCard}
                    isEditing={editingCardId === card.id}
                    editFront={editFront}
                    editBack={editBack}
                    onEditFrontChange={setEditFront}
                    onEditBackChange={setEditBack}
                    onSave={saveEdit}
                    onCancel={cancelEditCard}
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
