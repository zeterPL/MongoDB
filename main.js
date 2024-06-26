const { MongoClient } = require("mongodb");
const readline = require("readline");

const menuText = `Wybierz numer zadania do wykonania:
1. Zadanie 1
2. Zadanie 2
3. Zadanie 3
4. Zadanie 4
5. Zadanie 5
6. Zadanie 6
7. Zadanie 7
8. Zadanie 8
9. Zadanie 9
10. Zadanie 10
11. Zadanie 11
12. Zadanie 12
13. Zadanie 13
14. Wyjście
Twój wybór: `;

// Funkcja do wczytywania danych z konsoli
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db("IMDB");

    const titleCollection = db.collection("Title");
    const ratingCollection = db.collection("Rating");

    const exitNumber = "14";
    while (true) {
      const choice = await prompt(menuText);
      if (choice == exitNumber) return;
      switch (choice) {
        case "1":
          //Zdanie 1

          console.log("Zadanie 1");

          const titleCount = await titleCollection.countDocuments();
          const ratingCount = await ratingCollection.countDocuments();

          console.log(`Liczba dokumentów Title: ${titleCount}`);
          console.log(`Liczba dokumentów Rating: ${ratingCount}`);
          console.log("---------------\n");
          break;
        case "2":
          //Zadanie 2

          console.log("Zadanie 2");

          const titles = await titleCollection
            .find({
              startYear: 2020,
              genres: { $regex: /Romance/, $options: "i" },
              runtimeMinutes: { $gt: 90, $lt: 120 },
            })
            .project({
              _id: 0,
              primaryTitle: 1,
              startYear: 1,
              genres: 1,
              runtimeMinutes: 1,
            })
            .sort({ primaryTitle: 1 })
            .limit(4)
            .toArray();

          titles.map((title) => console.log(title));
          console.log("---------------\n");
          break;
        case "3":
          //Zadanie 3
          console.log("Zadanie 3");

          const group = {
            $group: {
              _id: "$titleType",
              count: { $sum: 1 },
            },
          };
          const result = await titleCollection
            .aggregate([
              { $match: { startYear: 2000 } },
              group,
              { $sort: { _id: 1 } },
            ])
            .toArray();
          // console.log(result);
          result.map((t) => console.log(`Typ: ${t._id}, Liczba: ${t.count}`));

          console.log("---------------\n");
          break;
        case "4":
          //Zadanie 4
          console.log("Zadanie 4");

          const result4 = await titleCollection
            .aggregate([
              {
                $match: {
                  startYear: { $gte: 2010, $lte: 2012 },
                  titleType: "documentary",
                },
              },
              {
                $limit: 5,
              },
              {
                $lookup: {
                  from: "Rating",
                  localField: "tconst",
                  foreignField: "tconst",
                  as: "rating_info",
                },
              },
              { $unwind: "$rating_info" },
              {
                $project: {
                  _id: 0,
                  primaryTitle: 1,
                  startYear: 1,
                  averageRating: "$rating_info.averageRating",
                },
              },
              { $sort: { averageRating: -1 } },
            ])
            .toArray();

          console.log(result4);

          result4.map((t) => console.log(t));

          console.log("---------------\n");
          break;
        case "5":
          console.log("In progress...");
          break;
        case "6":
          console.log("In progress...");
          break;
        case "7":
          console.log("Zadanie 7");

          const maxAverageRating = await ratingCollection
            .aggregate([
              { $group: { _id: null, maxRating: { $max: "$averageRating" } } },
            ])
            .toArray();
          const maxRating = maxAverageRating[0].maxRating;
          console.log("Get max rating " + maxRating);
          const topRated = await ratingCollection
            .aggregate([
              { $match: { averageRating: maxRating } },
              {
                $lookup: {
                  from: "Title",
                  localField: "tconst",
                  foreignField: "tconst",
                  as: "title_info",
                },
              },
              { $unwind: "$title_info" },
            ])
            .toArray();

          console.log("Get top rated");

          const updatedTopRated = topRated.map((movie) =>
            titleCollection.updateOne(
              { tconst: movie.title_info.tconst },
              { $set: { max: 1 } }
            )
          );
          console.log("update");

          //await Promise.all(updatedTopRated);

          console.log(
            `Dodano pole z wartością 1 dla filmów z najwyższą średnią oceną (${maxRating})`
          );
          console.log("---------------\n");

          break;
        case "8":
          console.log("Zadanie 8");

          const title = await prompt("Podaj tytuł filmu: ");
          const year = await prompt("Podaj rok produkcji: ");

          const result8 = await titleCollection
            .aggregate([
              {
                $match: {
                  primaryTitle: title,
                  startYear: parseInt(year),
                },
              },
              {
                $lookup: {
                  from: "Rating",
                  localField: "tconst",
                  foreignField: "tconst",
                  as: "rating_info",
                },
              },
              {
                $unwind: "$rating_info",
              },
              {
                $project: {
                  _id: 0,
                  primaryTitle: 1,
                  startYear: 1,
                  averageRating: "$rating_info.averageRating",
                },
              },
            ])
            .toArray();

          if (result8.length > 0) {
            console.log("Wynik zapytania:");
            result8.map((doc) => console.log(doc));
          } else {
            console.log(
              "Nie znaleziono filmu o podanym tytule i roku produkcji."
            );
          }
          console.log("---------------\n");

          break;

        case "9":
          console.log("In progress...");
          break;
        case "10":
          console.log("In progress...");
          break;
        case "11":
          console.log("In progress...");
          break;
        case "12":
          console.log("Zadanie 12");
          const updateResult = await titleCollection.updateOne(
            { primaryTitle: "Pan Tadeusz", startYear: 1999 },
            { $set: { avgRating: 9.1 } },
            { upsert: true }
          );

          if (updateResult.upsertedCount > 0) {
            console.log("Film nie istniał. Dodano nowy dokument.");
          } else if (updateResult.modifiedCount > 0) {
            console.log("Film istniał. Zaktualizowano dokument.");
          } else {
            console.log("Nie dokonano żadnych zmian.");
          }
          console.log("---------------\n");
          break;
        case "13":
          console.log("Zadanie 13");

          const deleteResult = await titleCollection.deleteMany({
            startYear: { $lt: 1989 },
          });
          console.log(
            `Usunięto ${deleteResult.deletedCount} dokumentów reprezentujących filmy wyprodukowane przed 1989 rokiem`
          );
          console.log("---------------\n");

          break;
        case "14":
          break;
        default:
          console.log("Nieprawidłowy wybór.");
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    console.log("close mongoDB connenction");

    await client.close();
  }
}

main();
