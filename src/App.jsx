import { useEffect, useState } from "react";
import { ref as firebaseRef, onValue, update } from "firebase/database";
import { database } from "./utils/firebase";

function App() {
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState([]);
  const [choiceSubmitted, setChoiceSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username.trim()) {
      // Save the username and initialize with 'enabled' as true
      const updates = {
        [`/responses/${username}`]: "",
      };
      update(firebaseRef(database, "react-intro-survey"), updates)
        .then(() => {
          console.log(`User "${username}" saved to Firebase`);
          setIsRegistered(true);
        })
        .catch((err) => console.error("Error saving to Firebase:", err));
    }
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();

    const data = new FormData(e.target);

    const choice = data.get("choice");

    update(firebaseRef(database, "react-intro-survey"), {
      [`/responses/${username}`]: choice,
    })
      .then(() => {
        console.log(`User's choice submitted`);
        setChoiceSubmitted(true);
      })
      .catch((err) => console.error("Error saving to Firebase:", err));
  };
  useEffect(() => {
    if (isRegistered && username) {
      onValue(firebaseRef(database, "react-intro-survey"), (snapshot) => {
        const familiarity = snapshot.val();
        setQuestion(familiarity.question);
        setChoices(familiarity.choices);
      });
    }
  }, [isRegistered, username]);

  return (
    <div className="flex flex-col justify-around h-[80vh]">
      {!choiceSubmitted ? (
        <>
        <h2>Quick survey 🤔</h2>
      <div className="text-2xl">
        {!isRegistered ? (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-2">
              <label>Enter your username: </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 rounded border border-black dark:border-white"
              />
            </div>
            <button
              className="bg-orange-500 text-white py-2 px-1 rounded w-full"
              type="submit"
            >
              Submit
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitAnswer}>
            <fieldset className="space-y-6">
              <legend className="text-orange-500 mb-10">{question}</legend>
              {choices?.length > 0 ? (
                <div className="flex flex-col space-y-2 text-base">
                  {choices.map((choice, index) => (
                    <div className="space-x-2" key={`${choice}-${index}`}>
                      <input
                        type="radio"
                        id={choice}
                        name={"choice"}
                        value={choice}
                      />
                      <label htmlFor={choice}>{choice}</label>
                    </div>
                  ))}
                </div>
              ) : null}
              <div>
                <button type="submit">Submit</button>
              </div>
            </fieldset>
          </form>
        )}
      </div></>
      ): <h1>Thank you for answering! 🙏</h1>}
    </div>
  );
}

export default App;
