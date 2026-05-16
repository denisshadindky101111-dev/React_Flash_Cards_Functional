import React, { useEffect, useState } from 'react';

function App() {
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [editingCardId, setEditingCardId] = useState(null);
  const [editCardFront, setEditCardFront] = useState('');
  const [editCardBack, setEditCardBack] = useState('');
  const [studyState, setStudyState] = useState({
    isStudyMode: false,
    studyCards: [],
    currentIndex: 0,
    showFront: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('flashcards-app-data');
    
    if (saved && JSON.parse(saved).length > 0) {
      const parsed = JSON.parse(saved);
      setDecks(parsed);
      setSelectedDeck(parsed[0]);
    } else {
      fetch('https://opentdb.com/api.php?amount=50')
        .then((response) => response.json())
        .then((data) => {
          const apiCards = data.results.map((item) => ({
            id: String(Date.now() + Math.random()),
            front: item.question,
            back: item.correct_answer,
            learned: false,
          }));

          const defaultDeck = {
            id: 'api-deck',
            name: 'API Deck',
            cards: apiCards,
          };

          const newDecksArray = [defaultDeck];
          
          setDecks(newDecksArray);
          setSelectedDeck(defaultDeck);
        })
        .catch((error) => console.error('Error loading API:', error));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('flashcards-app-data', JSON.stringify(decks));
  }, [decks]);

  const handleDeckNameChange = (e) => setNewDeckName(e.target.value);
const handleFrontChange = (e) => setNewCardFront(e.target.value);
const handleBackChange = (e) => setNewCardBack(e.target.value);

const handleCreateDeck = (e) => {
  e.preventDefault();
  if (!newDeckName.trim()) return;

  const newDeck = {
    id: `deck-${Date.now()}`,
    name: newDeckName,
    cards: []
  };

  const updatedDecks = [...decks, newDeck];
  setDecks(updatedDecks);
  
  if (!selectedDeck) {
    setSelectedDeck(newDeck);
  }

  setNewDeckName('');
};


  return (
    <div>
    </div>
  );
}

export default App;


