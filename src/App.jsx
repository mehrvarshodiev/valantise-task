import { useEffect, useState } from "react";
import "./App.css";
import md5 from "md5";

function App() {
  const [loading, setLoading] = useState(false);
  const [dataProducts, setDataProducts] = useState([]);

  function generateAuthToken() {
    let dt = new Date();
    let year = dt.getFullYear();
    let month = dt.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let date = dt.getDate();
    date = date < 10 ? `0${date}` : date;
    let timestamp = `${year}${month}${date}`;
    return md5(`Valantis_${timestamp}`);
  }

  async function fetchData() {
    try {
      setLoading(true);
      const API = "http://api.valantis.store:40000/";
      const authToken = generateAuthToken();
      const responseIds = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth": authToken,
        },
        body: JSON.stringify({
          action: "get_ids",
          params: { limit: 50 },
        }),
      });
      const dataIds = await responseIds.json();
      const { result: ids } = dataIds;
      const responseItems = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth": authToken,
        },

        body: JSON.stringify({
          action: "get_items",
          params: {
            ids: [...ids],
          },
        }),
      });

      const dataItems = await responseItems.json();
      const { result: items } = dataItems;

      const uniqueIds = {};
      const uniqueItems = items?.filter((item) => {
        if (!uniqueIds[item.id]) {
          uniqueIds[item.id] = true;
          return true;
        }
        return false;
      });
      console.log(uniqueItems);
      setDataProducts(uniqueItems);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error("Error fetching data", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">
      {!loading ? (
        <div className="card_wrapper flex">
          <p>{dataProducts?.length}</p>
          {dataProducts?.map((dataProduct) => (
            <figure key={dataProduct.id} className="card">
              <div className="img"></div>
              <figcaption>
                <div className="flex">
                  <h3 className="title">{dataProduct?.brand || "Unknown"}</h3>
                  <p className="price">{dataProduct?.price || 0} $</p>
                </div>
                <p className="info">{dataProduct?.product || ""}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default App;
