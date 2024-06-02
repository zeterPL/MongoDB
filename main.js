const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri)

    try {

        await client.connect();

        const db = client.db('IMDB');

        //Zdanie 1

        console.log("Zadanie 1");
        const titleCollection = db.collection('Title');
        const ratingCollection = db.collection('Rating');

        const titleCount = await titleCollection.countDocuments();
        const ratingCount = await ratingCollection.countDocuments();

        console.log(`Liczba dokumentów Title: ${titleCount}`);
        console.log(`Liczba dokumentów Rating: ${ratingCount}`);
        console.log("---------------\n");



    } catch(error) {
        console.log(error);
    } 
    finally {
        console.log("close");

        await client.close();
    }

}

main()
