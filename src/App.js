import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,
  Button,
  Heading,
  Image,
  View,
  Card,
} from "@aws-amplify/ui-react";

import { API } from "aws-amplify";



//declarations related to Categories
import { listCategories } from './graphql/queries'
import { listCategoryType } from './graphql/customqueries'
import { createCategories } from './graphql/mutations'

//declarations related to Media
import { listMedia } from './graphql/queries'
import { createMedia } from './graphql/mutations'
import { Amplify,Storage } from 'aws-amplify';
import config from './aws-exports';
Amplify.configure(config);

function App({ signOut }) {
  //declarations related to Categories
  const [categories, setcategories] = useState([]);
  const [newcategoryname, setnewcategoryname] = useState('');
  const [newcategorydisplayname, setnewcategorydisplayname] = useState('');
  const [newcategorytype, setnewcategorytype] = useState('');
  const [inbuiltcategorytypes, setinbuiltcategorytypes] = useState([]);

  //declarations related to Media
  const [mediaarray, setmediaarray] = useState([]);
  const [mediatitle, setmediatitle] = useState('');
  const [mediadescription, setmediadescription] = useState('');
  const [mediacategory, setmediacategory] = useState('');
  const [mediathumbnail, setmediathumbnail] = useState('');


  useEffect(() => {

    //function calls related to Categories
    fetchCategories();
    fetchCategoryType();
    //function calls related to Media
    fetchMedia();
  }, [])

  //functions related to Categories ----------- Start
  const fetchCategories = async () => {
    const responsedata = await API.graphql({ query: listCategories });
    const categoryInfo = responsedata.data.listCategories.items;
    setcategories(categoryInfo);
  }
  const fetchCategoryType = async () => {
    const responsedata = await API.graphql({ query: listCategoryType, variables: { enum: "CategoryType" } });
    const inbuiltcategorytypes = responsedata.data.enum.enumValues;
    setinbuiltcategorytypes(inbuiltcategorytypes);
  }
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const categorydata = {
      name: newcategoryname,
      displayname: newcategorydisplayname,
      type: newcategorytype
    }
    await API.graphql({
      query: createCategories,
      variables: { input: categorydata },
    }).then(response => {
      setcategories([...categories, response.data.createCategories]);
      console.log(response);
    }).catch(error => { debugger; })
  }
  //functions related to Categories ----------- End


   //functions related to Media ----------- Start
   const fetchMedia = async () => {
    const responsedata = await API.graphql({ query: listMedia });
    const mediaInfo = responsedata.data.listMedia.items;
    setmediaarray(mediaInfo);
    console.log(mediaInfo);
  }

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    const mediadata = {
      Title: mediatitle,
      Description: mediadescription,
      Category:mediacategory,
      Thumbnail:mediathumbnail
    }
    await API.graphql({
      query: createMedia,
      variables: { input: mediadata },
    }).then(response => {
      setmediaarray([...mediaarray, response.data.createMedia]);
      console.log(response);
      debugger;
    }).catch(error => { debugger; })
  }

   //functions related to Media ----------- End

   async function handlefileUpload(e) {
    const file = e.target.files[0];
    try {
      await Storage.put(file.name, file, {
        //contentType: "image/png", // contentType is optional
      }).then(response=>{
        console.log(`${config.aws_user_files_s3_bucket}.s3.amazonaws.com/public/${response.key}`)
        setmediathumbnail(`https://${config.aws_user_files_s3_bucket}.s3.amazonaws.com/public/${response.key}`)
      }).catch(error=>{
        debugger;
      })
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  
 

  return (
    <View className="App">
      <Card>
        <form onSubmit={handleCategorySubmit}>
          <input value={newcategoryname} placeholder="Enter a new category" onChange={(e) => { setnewcategoryname(e.target.value) }} />
          <input value={newcategorydisplayname} placeholder="Enter a displayname for the category" onChange={(e) => { setnewcategorydisplayname(e.target.value) }} />
          <select name="categorytype" id="categorytype" onChange={(e)=>{setnewcategorytype(e.target.value)}}>
            {
              inbuiltcategorytypes.map((cattype) => {
                return (
                  <option value={cattype.name}>{cattype.name}</option>
                )
              })
            }
          </select>
          <button>Create category</button>
        </form>
      </Card>
      <Card>
        {
          categories.map((cat) => {
            return (
              <p>{cat.name}</p>
            )
          })
        }
      </Card>
      <Card>
        <form onSubmit={handleMediaSubmit}>
          <input value={mediatitle} placeholder="Enter title for media" onChange={(e) => { setmediatitle(e.target.value) }} />
          <input value={mediadescription} placeholder="Enter description" onChange={(e) => { setmediadescription(e.target.value) }} />
          <select name="mediacateogry" id="mediacateogry" onChange={(e)=>{setmediacategory(e.target.value)}}>
            {
              categories.map((cat) => {
                return (
                  <option value={cat.name}>{cat.name}</option>
                )
              })
            }
          </select>
          <button>Create Media item</button>
        </form>
      </Card>
      <Card>
        {
          mediaarray.map((media) => {
            return (
              <p>{media.Title}</p>
            )
          })
        }
      </Card>

      <input type="file" onChange={handlefileUpload} />;
      <img src={mediathumbnail}/>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
}

export default withAuthenticator(App);