import axios, { AxiosResponse } from "axios";
import { createAddon, MovieItem, runCli, Source } from "@mediaurl/sdk";

const playlistIds: Array<string> = [
  "KR8ToceK",
  "xk97tkEg",
  "BhUjQsgm",
  "9afj76ja",
  "Hclx7wab",
  "yjOhwZd9",
];
const playlists: any = new Map();
const btItems: any = new Map();

async function fetchData() {
  // fetch playlist(category) information
  for (let feedId of playlistIds) {
    // console.log(feedId);
    try {
      const res: AxiosResponse = await axios.get(
        `https://content.jwplatform.com/v2/playlists/${feedId}`
      );
      if (res.status === 200 && res.data) {
        // console.log(res.data);
        playlists.set(feedId, res.data);
        res.data.playlist.forEach((item) => btItems.set(item.mediaid, item));
      }
    } catch (err) {
      console.log(err);
    }
  }
}

fetchData()
  .then(() => {
    // console.log([...playlists.values()]);
    const btAddon = createAddon({
      id: "sb-bt-addon",
      name: "BigThink-Addon",
      version: "0.0.1",
      icon:
        "https://assets.rebelmouse.io/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbWFnZSI6Imh0dHBzOi8vYXNzZXRzLnJibC5tcy8xODc3Nzg2OS8yMDAweC5wbmciLCJleHBpcmVzX2F0IjoxNjM2MzE3MDI3fQ.NfA8SnVWt_f-MZFbJ9H_FFQDk7eHOG5HUy-2BrbxGrs/img.png?width=32&height=32",
      description: "My first addon description",
      adult: false,
      itemTypes: ["movie"],
      catalogs: [...playlists.values()].map((pl) => ({
        id: pl.feedid,
        name: pl.title,
        adult: false,
      })),
      // triggers: ["mediaId"],
    });

    btAddon.registerActionHandler("catalog", async (input, ctx) => {
      console.log("registerActionHandler() - catalog ", input.name, input);
      const items: MovieItem[] = playlists
        .get(input.id)
        ?.playlist.map((item) => {
          return <MovieItem>{
            id: item.mediaid,
            type: "movie",
            ids: {
              mediaId: item.mediaid,
            },
            name: item.title,
            originalName: item.originalName,
            description: item.description,
            images: { poster: item.image },
            sources: item.sources.map(
              (src) =>
                <Source>{
                  type: "url",
                  url: src.file,
                  name: src.label,
                  format: src.type,
                }
            ),
          };
        });

      return {
        nextCursor: null,
        items,
      };
    });

    /*btAddon.registerActionHandler("item", async (input, ctx) => {
      console.log("registerActionHandler() - item ", input.ids, input.name);

      const item = btItems.get(input.ids.mediaId);

      return item
        ? <MovieItem>{
            type: "movie",
            ids: {
              mediaId: item.mediaid,
            },
            name: item.title,
            originalName: item.originalName,
            description: item.description,
            images: { poster: item.image },
            sources: item.sources.map(
              (src) =>
                <Source>{
                  type: "url",
                  url: src.file || "",
                  name: src.label || "",
                  format: src.type || "",
                }
            ),
          }
        : null;
    });*/

    /*btAddon.registerActionHandler("source", async (input, ctx) => {
      console.log("registerActionHandler() - source ", input.name, input);
      return null;
    });*/

    runCli([btAddon]);
  })
  .catch((err) => console.log(err));
