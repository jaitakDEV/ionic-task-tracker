import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonToast,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import "./Home.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../composables/useSQLiteDB";
import { IonIcon } from "@ionic/react";
import { addOutline, text } from "ionicons/icons";
import { trashOutline } from "ionicons/icons";

type SQLItem = {
  id: number;
  name: string;
  day: string;
};

const Home: React.FC = () => {
  const [inputName, setInputName] = useState("");
  const [inputDay, setInputDay] = useState("");
  const [items, setItems] = useState<Array<SQLItem>>([]);
  const [showAddToast, setShowAddToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const { performSQLAction, initialized } = useSQLiteDB();

  useEffect(() => {
    showData();
  }, [initialized]);

  const showData = async () => {
    try {
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`SELECT * FROM test`);
        console.log("Show Loaded Data:", respSelect?.values);
        setItems(respSelect?.values || []);
      });
    } catch (error) {
      alert((error as Error).message);
      setItems([]);
    }
  };

  const addTask = async () => {
    try {
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(
            `INSERT INTO test (id, name, day) VALUES (?, ?, ?);`,
            [Date.now(), inputName, inputDay]
          );

          const respSelect = await db?.query(`SELECT * FROM test;`);
          console.log("New Task added:", {
            id: Date.now(),
            name: inputName,
            day: inputDay,
          });
          setItems(respSelect?.values || []);
          setShowAddToast(true);
        },

        async () => {
          setInputName("");
          setInputDay("");
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const deleteTask = async (itemId: number) => {
    try {
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`DELETE FROM test WHERE id=?;`, [itemId]);

          const respSelect = await db?.query(`SELECT * FROM test;`);
          setItems(respSelect?.values || []);
          console.log("Task Deleted", itemId);
          setShowDeleteToast(true);
        },
        async () => {
          setInputName("");
          setInputDay("");
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle
            style={{ textAlign: "center", width: "100%", fontStyle: "italic" }}
          >
            Testing App
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="8" offset-md="2">
              <IonCard className="card-container">
                <IonCardHeader>
                  <IonCardTitle
                    style={{
                      color: "black",
                      textAlign: "center",
                      width: "100%",

                      fontWeight: "bold",
                    }}
                  >
                    Task Tracker
                  </IonCardTitle>
                  <IonCardSubtitle
                    style={{
                      color: "black",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    Manage your tasks efficiently
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonInput
                      type="text"
                      placeholder="Add Your Task!"
                      value={inputName}
                      onIonInput={(e) => setInputName(e.target.value as string)}
                    ></IonInput>
                  </IonItem>
                  <br />
                  <IonItem>
                    <IonInput
                      type="text"
                      placeholder="Add Day & Time!"
                      value={inputDay}
                      onIonInput={(e) => setInputDay(e.target.value as string)}
                    ></IonInput>
                  </IonItem>
                  <br />
                  <IonButton
                    onClick={addTask}
                    disabled={inputName.trim() === "" || inputDay.trim() === ""}
                    expand="block"
                    size="default"
                    color="primary"
                    className="add-task-button"
                  >
                    ADD TASK
                    <IonIcon slot="start" icon={addOutline} />
                  </IonButton>
                  <div className="list-container">
                    {items.length === 0 ? (
                      <IonItem>
                        <IonLabel>No more tasks</IonLabel>
                      </IonItem>
                    ) : (
                      items.map((item) => (
                        <IonItem key={item.id} className="list-item">
                          <IonLabel className="ion-text-wrap">
                            {item.name} - {item.day}
                          </IonLabel>
                          <IonButton
                            slot="end"
                            color="danger"
                            onClick={() => deleteTask(item.id)}
                          >
                            <IonIcon icon={trashOutline} />
                          </IonButton>
                        </IonItem>
                      ))
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonToast
          isOpen={showAddToast}
          onDidDismiss={() => setShowAddToast(false)}
          message="Task added successfully!"
          duration={3000}
        />
        <IonToast
          isOpen={showDeleteToast}
          onDidDismiss={() => setShowDeleteToast(false)}
          message="Task deleted successfully!"
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
