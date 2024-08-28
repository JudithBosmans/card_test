import React from "react";
import Deck from "./Deck";
import styles from "../styles/styles.module.css";

export default function App() {
  return (
    <div className={styles.container}>
      <Deck />
    </div>
  );
}
