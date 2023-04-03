import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import GoogleMapReact from "google-map-react";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export const MapDeckGl = () => {
  //req const for sending an http req to the back
  const { sendRequest } = useHttpClient();

  //const for the map, center is in the center of thessaloniki
  const mapRef = useRef();
  const center = {
    lat: 40.6401,
    lng: 22.9444,
  };

  //hook for the data (trees), set to null originially before fetching it from backend
  const [sourceData, setSourceData] = useState(null);

  //auth constants
  const auth = useContext(AuthContext);
  const userId = auth.userId;

  //this useEffect hook fetches the trees, transforms the daya to geoJson 
  //and sets the sourceData to the geoJson (data1)
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/trees"
        );
        let data1 = responseData.trees.map((tree) => ({
          type: "Feature",
          properties: {
            id: tree._id,
            date: tree.date,
            owner: tree.owner,
          },
          geometry: {
            type: "Point",
            coordinates: [tree.location.lng, tree.location.lat],
          },
        }));
        setSourceData(data1);
      } catch (err) {}
    };
    fetchTrees();
  }, [sendRequest]);

  //this hook is for the Deck.Gl. It generates the layer of data (dots) from the sourceData (trees)
  const [deckOverlay, setDeckOverlay] = useState(
    new GoogleMapsOverlay({
      layers: [
        new GeoJsonLayer({
          id: "scatterplot-layer",
          data: sourceData,
          opacity: 0.8,
          filled: true,
          radiusMinPixels: 2,
          radiusMaxPixels: 5,
          getFillColor: (d) => [255, 140, 0],
          getRadius: 5,
        }),
      ],
    })
  );


  //this function calculates the color of the trees based on the owner and date planted
  function calculateColor(date, owner) {
    if (owner != null) {
      if (owner == userId) {
        return [255, 0, 255];
      } else return [192, 192, 192];
    } else {
      let date1 = new Date(date);
      if (Date.now() - date1.getTime() > 94670856000) {
        return [42, 148, 27];
      } else return [0, 130, 255];
    }
  }

  //this connects the layer with the google maps
  useEffect(() => {
    let GMO = new GoogleMapsOverlay({
      layers: [
        new GeoJsonLayer({
          id: "scatterplot-layer",
          data: sourceData,
          pickable: true,
          opacity: 0.8,
          filled: true,
          radiusMinPixels: 1,
          radiusMaxPixels: 5,
          getFillColor: (d) =>
            calculateColor(d.properties.date, d.properties.owner),
          getPointRadius: 2,
          onClick: (d) =>
            handleClickOpen(
              d.object.properties.id,
              d.object.properties.date,
              d.object.properties.owner
            ),
        }),
      ],
    });
    GMO.setMap(mapRef.current);
    setDeckOverlay(GMO);
  }, [sourceData]);

  //constants needed for the popups when clicked
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

  const [idOfTree, setIdOfTree] = useState(null);
  const [dateOfTree, setDateOfTree] = useState(null);
  const [ownerOfTree, setOwnerOfTree] = useState(null);
  const [title, setTitle] = useState("Θέλετε να υιοθετήσετε αυτό το δέντρο;");
  const [description, setDescription] = useState(
    "Θέλετε να υιοθετήσετε αυτό το δέντρο; Η υιοθεσία είναι μεγάλη ευθύνη!"
  );

  //based on the id date and owner, various popups of text show up
  const handleClickOpen = (id2, date2, owner2) => {
    setIdOfTree(id2);
    setDateOfTree(date2);
    setOwnerOfTree(owner2);
    if (owner2 != null && owner2 != userId) {
      setTitle("Αυτό το δέντρο έχει ήδη ιδιοκτήτη!");
      setDescription("Παρακαλούμε επιλέξτε άλλο δέντρο!");
    } else if (owner2 != null && owner2 == userId) {
      setTitle("Αυτό το δέντρο σας ανήκει!");
      setDescription(
        "Αν θέλετε να υιοθετήσετε, παρακαλούμε επιλέξτε άλλο δέντρο!"
      );
    } else if (
      JSON.stringify(calculateColor(date2, owner2)) ==
      JSON.stringify([0, 130, 255])
    ) {
      setTitle("Αυτό το δέντρο είναι ακόμα νέο, θέλετε να το υιοθετήσετε;");
      setDescription(
        "Αυτό το δέντρο είναι μπλέ γιατί είναι ακόμα νέο. Τα νεά δέντρα απαιτούν περισσότερο πότισμα. Είστε σίγουροι πως θέλετε να το υιοθετήσετε;"
      );
    } else {
      setTitle("Υιοθετήστε αυτό το δέντρο;");
      setDescription(
        "Θέλετε να υιοθετήσετε αυτό το δέντρο; Η υιοθεσία είναι μεγάλη ευθύνη!"
      );
    }
    setOpen(true);
  };

  //to close the popups
  const handleClose2 = () => {
    setOpen2(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //async function that handles the adoption
  async function handleAdopt() {
    try {
      const responseData = await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/trees/${idOfTree}/adopt`,
        "PATCH",
        JSON.stringify({
          uid: userId,
          tid: idOfTree,
        }),
        {
          "Content-Type": "application/json",
        }
      );
    } catch (err) {}
    setSourceData((currentData) => {
      let arr = currentData.map((el) => {
        let newElement = { ...el };
        if (el.properties.id == idOfTree) {
          newElement.properties.owner = userId;
        }
        return newElement;
      });
      return arr;
    });
    setOpen(false);
    setOpen2(true);
  }

  //history for the router of pages
  let history = useHistory();
  function handleRedirect2trees() {
    history.push("/trees");
  }

  //if there is no data (delay while we get the trees) doesnt display an empty map with no trees
  //but displays a loading screen. Else it displays the google map with various dialogs that are..
  //.. all initially not open.
  if (sourceData == null) {
    return (
      <>
        <Card
          sx={{
            height: "100vh",
            width: "100%",
            textAlign: "center",
            margin: "auto",
          }}
        >
          <CardContent>
            <Typography variant="h5" component="div">
              38441 δέντρα φορτώνουν 🌳
            </Typography>

            <Typography variant="body2">
              <CircularProgress />
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  } else
    return (
      <div style={{ height: "100vh", width: "100%" }}>
        <DeckGL>
          <GoogleMapReact
            bootstrapURLKeys={{
              key: process.env.REACT_APP_GOOGLE_API_KEY,
            }}
            defaultCenter={center}
            defaultZoom={15}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map }) => {
              mapRef.current = map;
              deckOverlay.setMap(map);
            }}
          ></GoogleMapReact>
        </DeckGL>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="Title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {description}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>ΑΚΥΡΩΣΗ</Button>
            <Button
              onClick={handleAdopt}
              disabled={ownerOfTree != null}
              autoFocus
            >
              ΥΙΟΘΕΤΗΣΤΕ ΤΟ!
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={open2}
          onClose={handleClose2}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="Adopt notification">
            {"Συγχαρητήρια! Υιοθετήσατε ένα δέντρο επιτυχώς!"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Θέλετε να δείτα τα δέντρα σας, ή να υιοθετήσετε ακόμα ένα δέντρο;
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRedirect2trees}>ΔΕΙΤΕ ΤΑ ΔΕΝΤΡΑ ΣΑΣ</Button>
            <Button onClick={handleClose2} autoFocus>
              ΥΙΟΘΕΤΗΣΤΕ ΑΚΟΜΑ ΕΝΑ
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
};
export default MapDeckGl;
