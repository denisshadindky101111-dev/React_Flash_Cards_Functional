import { useCallback, useEffect, useState } from "react";
import "./App.css";
import StudyMode from "./StudyMode";
import DeckSelector from "./deckSelector";
import CreateDeckForm from "./CreateDeckForm";
import AddCardForm from "./AddCardForm";
import CardList from "./CardList";

const createId = () => `${Date.now()}-${Math.random()}`;
const API_DECK_NAME = "Викторина из интернета";

const fixText = (text) => {
  if (!text) return "";
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
};

const fixDeck = (deck) => ({
  ...deck,
  id: String(deck.id),
  cards: (Array.isArray(deck.cards) ? deck.cards : []).map((card) => ({
    ...card,
    id: String(card.id),
    front: fixText(card.front ?? ""),
    back: fixText(card.back ?? ""),
  })),
});

const loadApiDeck = async () => {
  const response = await fetch("https://opentdb.com/api.php?amount=50");
  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  const data = await response.json();
  if (data.response_code !== 0) {
    throw new Error(`Сайт вернул ошибку: ${data.response_code}`);
  }
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
    let cancelled = false;

    const start = async () => {
      let decksList = [];

      const saved = localStorage.getItem("flashcards-app-data");
      if (saved) {
        try {
          const savedDecks = JSON.parse(saved);
          if (Array.isArray(savedDecks)) {
            decksList = savedDecks.map(fixDeck);
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
          if (!cancelled && apiDeck.cards.length > 0) {
            decksList = [...decksList, fixDeck(apiDeck)];
          }
        } catch (error) {
          console.error("Не удалось загрузить колоду с сайта:", error);
        }
      }

      if (cancelled) return;

      setDecks(decksList);
      setSelectedDeckNumber(decksList.length > 0 ? decksList[0].id : null);
      setCanSave(true);
    };

    start();

    return () => {
      cancelled = true;
    };
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
          <CreateDeckForm
            name={newDeckName}
            onNameChange={setNewDeckName}
            onCreate={createDeck}
          />

          <DeckSelector
            decks={decks}
            selectedDeckNumber={selectedDeckNumber}
            onSelectDeck={selectDeck}
            onDeleteDeck={deleteDeck}
          />

          <hr />

          <AddCardForm
            front={newCardFront}
            back={newCardBack}
            onFrontChange={setNewCardFront}
            onBackChange={setNewCardBack}
            onAdd={createCard}
          />

          <hr />

          <CardList
            currentDeck={currentDeck}
            editingCardId={editingCardId}
            editFront={editFront}
            editBack={editBack}
            onLearned={toggleLearned}
            onDelete={deleteCard}
            onEdit={startEditCard}
            onEditFrontChange={setEditFront}
            onEditBackChange={setEditBack}
            onSave={saveEdit}
            onCancel={cancelEditCard}
          />

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
