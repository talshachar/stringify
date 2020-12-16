import './App.scss';
import logoSVG from './assets/logo.svg';
import sendSVG from './assets/icons/send.svg';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { useState, useRef, useEffect } from 'react';


if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyAA1xg3fmbDKt6RL1pukWoXqYFYZbSRFB8",
    authDomain: "stringify-6896b.firebaseapp.com",
    projectId: "stringify-6896b",
    storageBucket: "stringify-6896b.appspot.com",
    messagingSenderId: "370722665980",
    appId: "1:370722665980:web:f42282433428f8da92ae79"
  });
}

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logoSVG} alt=""/> */}
        <h1>Stringify</h1>
        {user && [
          <SignOut />,
          <div className="logged-in-user">
            {user && <img src={user.photoURL} alt="" />}
            {user.displayName}
          </div>
        ]
        }
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle} className="sign-in">Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(40);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const bottom = useRef();

  useEffect(() => {
    bottom.current.scrollIntoView();
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault();

    if (formValue === '') return;

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    bottom.current.scrollIntoView();
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={bottom}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input type="text" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="sumbit"><img src={sendSVG} alt=""/></button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  )
}

export default App;
