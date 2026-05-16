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
    if (saved) {
      const parsed = JSON.parse(saved);
      setDecks(parsed);
      setSelectedDeck(parsed.length > 0 ? parsed[0] : null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('flashcards-app-data', JSON.stringify(decks));
  }, [decks]);

  return (
    <div>
    </div>
  );
}

export default App;

