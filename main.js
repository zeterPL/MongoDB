const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db("IMDB");

    //Zdanie 1

    console.log("Zadanie 1");
    const titleCollection = db.collection("Title");
    const ratingCollection = db.collection("Rating");

    const titleCount = await titleCollection.countDocuments();
    const ratingCount = await ratingCollection.countDocuments();

    console.log(`Liczba dokumentów Title: ${titleCount}`);
    console.log(`Liczba dokumentów Rating: ${ratingCount}`);
    console.log("---------------\n");

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
  } catch (error) {
    console.log(error);
  } finally {
    console.log("close");

    await client.close();
  }
}

main();
