package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"
)
type developer struct {
	Name string `json:"name"`
	Price   string `json:"price"`
	Hours   string `json:"hours"`
}

const dataFile = "./cart.json"

var developerMutex = new(sync.Mutex)

func handleCart(w http.ResponseWriter, r *http.Request){
	developerMutex.Lock()
	defer developerMutex.Unlock()

	fi, err := os.Stat(dataFile)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to stat the data file (%s): %s", dataFile, err), http.StatusInternalServerError)
		return
	}


	developerData, err := ioutil.ReadFile(dataFile)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to read the data file (%s): %s", dataFile, err), http.StatusInternalServerError)
		return
	}

	switch r.Method {
	case "POST":
		// Decode the JSON data
		developers := make([]developer, 0)
		if err := json.Unmarshal(developerData, &developers); err != nil {
			http.Error(w, fmt.Sprintf("Unable to Unmarshal developers from data file (%s): %s", dataFile, err), http.StatusInternalServerError)
			return
		}
		//TO-DO: Verify if users being added already exists
		r.ParseForm()
    fmt.Println(r.FormValue("data[hours]"))
		fmt.Println(len(developers));

		if r.FormValue("action") == "change" {
			for i := 0; i < len(developers); i++ {
        if developers[i].Name == r.FormValue("data[name]"){
					developers[i] = developer{Name: r.FormValue("data[name]"), Price: r.FormValue("data[price]"), Hours: r.FormValue("data[hours]")}
				}
			}
		} else {
			developers = append(developers, developer{Name: r.FormValue("name"), Price: r.FormValue("price"), Hours: r.FormValue("hours")})
		}

		developerData, err = json.MarshalIndent(developers, "", "    ")
		if err != nil {
			http.Error(w, fmt.Sprintf("Unable to marshal developers to json: %s", err), http.StatusInternalServerError)
			return
		}

		// Write out the comments to the file, preserving permissions
		err := ioutil.WriteFile(dataFile, developerData, fi.Mode())
		if err != nil {
			http.Error(w, fmt.Sprintf("Unable to write developers to data file (%s): %s", dataFile, err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache")
		io.Copy(w, bytes.NewReader(developerData))

	case "GET":
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache")
		// stream the contents of the file to the response
		io.Copy(w, bytes.NewReader(developerData))

	default:
		// Don't know the method, so error
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	http.HandleFunc("/cart.json", handleCart)
	http.Handle("/", http.FileServer(http.Dir("./")))
	log.Println("Server started: http://localhost:" + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
