import React, { useState } from "react";
import { useSprings, animated, to as interpolate } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

import styles from "../styles/styles.module.css";
import data from "../dataCards.json";

const topics = data.topics;

const cards = topics.reduce((acc, topic) => {
  const topicCards = topic.items.map((item) => ({
    image: item.img,
    title: item.title,
    text: item.content,
  }));
  return [...acc, ...topicCards];
}, []);

const to = (i) => ({
  x: 0,
  y: i * -3,
  scale: 2.5,
  rot: -7 + Math.random() * 20,
  delay: i * 100,
});

const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

const trans = (r, s) =>
  `perspective(1500px) rotateX(0deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(1)`;

function Deck() {
  const [gone] = useState(() => new Set());
  const [props, api] = useSprings(cards.length, (i) => ({
    ...to(i),
    from: from(i),
  }));
  const [tapTimer, setTapTimer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const TabBar = () => (
    <div className={styles.tabBar}>
      {cards.map((_, index) => (
        <div
          key={index}
          className={
            index <= currentIndex ? styles.activeTab : styles.inactiveTab
          }
        />
      ))}
    </div>
  );

  const flyOut = (index, dir, velocity) => {
    gone.add(index);
    const nextIndex = (currentIndex + 1) % cards.length;
    setCurrentIndex(nextIndex);

    api.start((i) => {
      if (index !== i) return;
      const x = (1500 + window.innerWidth) * dir;
      const rot = dir * 10 * velocity;
      const scale = 2.5;

      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: 200 },
      };
    });

    if (gone.size === cards.length)
      setTimeout(() => {
        gone.clear();
        api.start((i) => to(i));
      }, 600);
  };

  const bringBack = (index) => {
    if (index < 0 || index >= cards.length) return;

    gone.delete(index);
    api.start((i) => {
      if (index !== i) return;
      return {
        x: 0,
        rot: 0,
        scale: 2.5,
        delay: undefined,
        config: { friction: 50, tension: 200 },
      };
    });
    setCurrentIndex(index);
  };

  const bind = useDrag(
    ({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
      clearTimeout(tapTimer);
      const trigger = velocity > 0.2;
      const dir = xDir < 0 ? -1 : 1;

      if (!down && trigger) flyOut(index, dir, velocity);

      api.start((i) => {
        if (index !== i) return;
        const isGone = gone.has(index);
        const x = isGone ? (1500 + window.innerWidth) * dir : down ? mx : 0;
        const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0);
        const scale = down ? 3.3 : 3;

        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });

      if (!down && gone.size === cards.length)
        setTimeout(() => {
          gone.clear();
          api.start((i) => to(i));
        }, 600);
    }
  );

  const handleNextCard = () => {
    const currentCard = currentIndex;
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    handleCardTap(currentCard);
  };

  const handlePreviousCard = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      bringBack(previousIndex);
    }
  };

  const handleCardTap = (index) => {
    const dir = 1;
    flyOut(index, dir, 1);
  };

  const handleMouseDown = (index) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
    }, 200);
    setTapTimer(timer);
  };

  const handleMouseUp = (index, event) => {
    if (tapTimer) {
      clearTimeout(tapTimer);
      handleCardTap(index);
      setTapTimer(null);
    }
  };

  return (
    <div>
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div className={styles.deck} key={i} style={{ x, y }}>
          <animated.div
            {...bind(i)}
            onMouseDown={() => handleMouseDown(i)}
            onMouseUp={(event) => handleMouseUp(i, event)}
            style={{
              transform: interpolate([rot, scale], trans),
            }}
          >
            <div className={styles.cardContent}>
              <TabBar />
              <h2 className="cardTitle">{cards[i].title}</h2>
              <p className="cardText">{cards[i].text}</p>
              <img
                className="cardImage"
                src={cards[i].image}
                alt="Card"
              ></img>
              <div className={styles.controls}>
                {currentIndex > 0 && (
                  <button onClick={handlePreviousCard}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-arrow-left"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                      />
                    </svg>
                  </button>
                )}
                <button onClick={handleNextCard}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-right"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </animated.div>
        </animated.div>
      ))}
    </div>
  );
}

export default Deck;



