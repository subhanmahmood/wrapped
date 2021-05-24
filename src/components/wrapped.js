import React from 'react'
import ReactSwipe from 'react-swipe'
import superagent from 'superagent'
import toast, { Toaster } from 'react-hot-toast';


function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}


class Callback extends React.Component {
    constructor(props) {
        super(props)

        var params = getHashParams();
        this.state = {
            access_token: params.access_token,
            top_artists: [],
            top_tracks: [],
            data: [
                {
                    term: "short_term",
                    label: "Last month",
                    tracks: [],
                    artists: [],
                    genres: new Map()
                },
                {
                    term: "medium_term",
                    label: "Last 6 months",
                    tracks: [],
                    artists: [],
                    genres: new Map()
                },
                {
                    term: "long_term",
                    label: "All time",
                    tracks: [],
                    artists: [],
                    genres: new Map()
                }
            ],
            terms: [
                "short_term",
                "medium_term",
                "long_term"
            ],
            termLabels: [
                "Last month",
                "Last 6 months",
                "All time"
            ],
            colors: [
                "linear-gradient(0deg, #EC008C 0%, #FC6767 100%)",
                "linear-gradient(10.8deg, #FF6E7F 2.8%, #BFE9FF 98.38%)",
                "linear-gradient(4.8deg, #DA22FF 5.89%, #9733EE 95.62%)",
                "linear-gradient(0.03deg, #CC95C0 1.38%, #DBD4B4 50.68%, #7AA1D2 99.97%)",
                "linear-gradient(0.15deg, #E55D87 0.13%, #5FC3E4 99.88%)"
            ],
            userData: {},
            tempGenres: new Map(),
            footerHeight: 0,
            termCount: 0,
            genres: new Map(),
            validToken: true,
            loading: true,
            albumOffset: 0,
            albumContainerOffset: 0
        }

        this.getTopItems = this.getTopItems.bind(this)
        this.getArtistInfo = this.getArtistInfo.bind(this)
        this.redirectToHome = this.redirectToHome.bind(this)
        this.updateTermCount = this.updateTermCount.bind(this)
        this.updateGenres = this.updateGenres.bind(this)
        this.addToPlaylist = this.addToPlaylist.bind(this)
    }

    componentDidMount() {
        // add function to check if user is on mobile
        window.mobileCheck = function () {
            let check = false;
            (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        };

        // calc footer height
        const footerHeight = document.getElementById("footer").clientHeight
        this.setState({ footerHeight: footerHeight })

        const min = Math.ceil(0)
        const max = Math.ceil(this.state.colors.length - 1)
        const colorIdx = Math.floor(Math.random() * (max - min + 1)) + min

        // set bg based on user device
        if (window.mobileCheck()) {
            document.body.style.backgroundImage = this.state.colors[colorIdx];
        } else {
            document.body.style.backgroundColor = '#181818'
        }

        const mainPanelWidth = parseInt(document.getElementById("main-panel").style.width.slice(0, -2))
        this.setState({ albumOffset: Math.floor((mainPanelWidth - 126 - 24) / 5), albumContainerOffset: mainPanelWidth })


        // check if user is logged in
        superagent.get(`https://api.spotify.com/v1/me`)
            .set("Authorization", "Bearer " + this.state.access_token)
            .end((err, res) => {
                if (err) {
                    console.log(err)
                    if (err.status === 429) {
                        console.log(res.headers['Retry-After'])
                        setTimeout(() => {
                            window.location.reload();
                        }, res.headers['Retry-After'] * 1000)
                    }
                } else {
                    this.setState({ userData: res.body })
                }
            })
        
        // get top tracks, artists for each term [short, medium, long]
        this.state.data.forEach((item, i) => {
            this.getTopItems("tracks", item.term, 50)
                .then((res) => {

                    if (res.status === 429) {
                        console.log(res.headers['Retry-After'])
                        setTimeout(() => {
                            window.location.reload();
                        }, res.headers['Retry-After'] * 1000)
                    } else {
                        let updatedData = new Object(this.state.data)
                        updatedData[i].tracks = res.body.items
                        this.setState({ data: updatedData })
                    }

                })
                .catch((err) => {
                    if (err.status === 401) {
                        console.log(err.status)
                        this.setState({ validToken: false })
                        this.redirectToHome()
                    }
                })

            this.getTopItems("tracks", item.term, 50, 49)
                .then((res) => {
                    if (res.status === 429) {
                        console.log(res.headers['Retry-After'])
                        setTimeout(() => {
                            window.location.reload();
                        }, res.headers['Retry-After'] * 1000)
                    } else {
                        let updatedData = new Object(this.state.data)
                        updatedData[i].tracks.push(...res.body.items.slice(1))
                        this.setState({ data: updatedData }, this.updateGenres)
                    }
                })
                .catch((err) => {
                    if (err.status === 401) {
                        console.log(err.status)
                        this.setState({ validToken: false })
                        this.redirectToHome()
                    }
                })

            this.getTopItems("artists", item.term)
                .then((res) => {
                    if (res.status === 429) {
                        console.log(res.headers['Retry-After'])
                        setTimeout(() => {
                            window.location.reload();
                        }, res.headers['Retry-After'] * 1000)
                    } else {
                        let updatedData = new Object(this.state.data)
                        updatedData[i].artists = res.body.items
                        this.setState({ data: updatedData })
                    }
                })
                .catch((err) => {
                    if (err.status === 401) {
                        console.log(err.status)
                        this.setState({ validToken: false })
                        //this.redirectToHome()
                    }
                })

        })
    }

    componentWillUnmount() {
        document.body.style.backgroundImage = null;
    }

    updateTermCount() {
        this.setState({ loading: true, termCount: this.state.termCount + 1 }, this.updateValues);
    }

    updateGenres() {
        this.state.data.forEach((item, i) => {

            item.tracks.forEach((track, j) => {

                this.getArtistInfo(track.artists[0].id)
                    .then(res => {
                        let updatedData = new Object(this.state.data)

                        res.body.genres.forEach(genre => {
                            updatedData[i].genres.set(genre, (updatedData[i].genres.get(genre) || 0) + 1)
                        })
                        const finalGenres = new Map([...updatedData[i].genres.entries()].sort((a, b) => b[1] - a[1]));
                        updatedData[i].genres = finalGenres
                        this.setState({ data: updatedData })
                    })
                    .catch(err => {
                        console.log(err)
                        if (err.status === 401) {
                            this.redirectToHome()
                        }

                    })
            })
        })
    }

    addToPlaylist() {
        const playlistName = this.state.data[this.state.termCount % 3].label.toLowerCase()
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;
        superagent.post(`https://api.spotify.com/v1/users/${this.state.userData.id}/playlists`)
            .set("Authorization", "Bearer " + this.state.access_token)
            .set('Content-Type', 'application/json')
            .send({
                name: `Your WrappedWhenever from ${playlistName}`,
                description: `Created on ${today}`,
                public: false
            })
            .end((err, res) => {
                if (err) {
                    console.log(err)
                } else {

                    if (res.created === true) {

                        const trackURIs = this.state.data[this.state.termCount % 3].tracks.map((track, i) => {
                            return track.uri
                        })

                        superagent.post(`https://api.spotify.com/v1/playlists/${res.body.id}/tracks`)
                            .set("Authorization", "Bearer " + this.state.access_token)
                            .set('Content-Type', 'application/json')
                            .send(trackURIs)
                            .end((err, res) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    toast.success('Added your playlist!')
                                }
                            })
                    } else {
                        console.log("couldn't make playlist")
                        console.log(res)
                    }
                }
            })
    }

    async getArtistInfo(artistId) {
        return superagent.get(`https://api.spotify.com/v1/artists/${artistId}`)
            .set("Authorization", "Bearer " + this.state.access_token)
    }
    async getTopItems(item, term) {
        return superagent.get(`https://api.spotify.com/v1/me/top/${item}`)
            .query({ time_range: term })
            .set("Authorization", "Bearer " + this.state.access_token)
    }
    async getTopItems(item, term, limit, offset) {
        return superagent.get(`https://api.spotify.com/v1/me/top/${item}`)
            .query({ time_range: term })
            .query({ limit: limit })
            .query({ offset: offset })
            .set("Authorization", "Bearer " + this.state.access_token)
    }
    redirectToHome() {
        if (process.env.NODE_ENV === "production") {
            window.location = "https://wrappedwhenever.com/"
        } else {
            window.location = "http://localhost:3000"
        }
    }
    render() {
        const data = this.state.data[this.state.termCount % 3]
        const Genres = Array.from(data.genres.keys()).slice(0, 5).map((genre, i) => {
            return (
                <p key={i} className="d-sm-block text-truncate" ><b>{i + 1}</b>&nbsp;&nbsp;{genre}</p>
            )
        })

        const TrackList = data.tracks.slice(0, 20).map((track, i) => {
            let artists = ""
            track.artists.forEach((artist, i) => {
                artists += (i === track.artists.length - 1) ? `${artist.name}` : `${artist.name}, `
            });
            return (
                <div key={i} className="d-flex flex-row" style={{ paddingBottom: 20 }}>
                    <img alt={i} src={track.album.images[2].url} height="64" width="64" className="square-img" />
                    <div className="d-flex flex-column justify-content-center ps-3">
                        <b>{track.name}</b>
                        <small>{artists}</small>
                    </div>
                </div>
            )
        })
        const Artists = data.artists.slice(0, 20).map((artist, i) => {
            return (
                <div key={i} className="d-flex flex-row" style={{ paddingBottom: 20 }}>
                    <img alt={i} src={artist.images[2].url} height="64" width="64" className="square-img" />
                    <div className="d-flex flex-column justify-content-center ps-3">
                        <b>{artist.name}</b>
                    </div>
                </div>
            )
        })

        const styles = {
            main_color: '#181818',
            mobile_container: {
                padding: 20
            },
            main_card: {
                height: window.innerHeight - this.state.footerHeight - 40,
                backgroundImage: "linear-gradient(360deg, #181818 0%, #343434 100%)",
                borderRadius: 10,
                position: 'relative',
                overflowY: 'hidden'
            },
            button_panel: {
                height: window.innerHeight - this.state.footerHeight - 40,
                position: 'relative'
            },
            topHeading: {
                fontWeight: 700
            },
            textItem: {
                marginBottom: -4,
                fontSize: 12,
                maxWidth: 130
            },
            genreText: {
                textTransform: 'capitalize'
            },
            footerTag: {
                marginBottom: 0,
                fontWeight: 700,
                fontSize: 14
            }
        }

        const main_color = '#181818'


        let reactSwipeEl;
        return (
            <div>
                <div className="d-md-none d-lg-none d-xl-none d-xxl-none d-lg-block d-xl-block">
                    <div className="container">
                        <div className="row d-md-none d-lg-none d-xl-none d-xxl-none d-lg-block d-xl-block">
                            <div style={styles.mobile_container} className="col-sm">
                                <ReactSwipe
                                    className="carousel"
                                    swipeOptions={{ continuous: false }}
                                    ref={el => (reactSwipeEl = el)}
                                >
                                    <div id="main-panel" style={styles.main_card}>
                                        <div className="parent perspective" style={{ marginLeft: this.state.albumContainerOffset }}>
                                            {data.tracks.slice(0, 5).map((track, i) => {

                                                const offset = i * this.state.albumOffset;
                                                const index = 5 - i;
                                                return (
                                                    <img key={i} alt={i} id="track" style={{ right: offset, zIndex: index }} src={track.album.images[1].url} height="190" width="190" className="square-img child" />
                                                )
                                            })}
                                        </div>
                                        <div className="container-sm">
                                            <div className="row" style={{ marginTop: 210 }}>
                                                <div className="col">
                                                    <h6 style={styles.topHeading}>TOP ARTISTS</h6>
                                                    {data.artists.slice(0, 5).map((artist, i) => {
                                                        return (
                                                            <div key={i}><p className="d-block text-truncate" style={styles.textItem}><b>{i + 1}</b>&nbsp;&nbsp;{artist.name}</p></div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="col">
                                                    <h6 style={styles.topHeading}>TOP SONGS</h6>
                                                    {data.tracks.slice(0, 5).map((track, i) => {
                                                        return (
                                                            <div key={i}><p className="d-block text-truncate" style={styles.textItem}><b>{i + 1}</b>&nbsp;&nbsp;{track.name}</p></div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            <div className="row" style={{ marginTop: 20 }}>
                                                <h6 style={{ ...styles.topHeading, textAlign: 'center' }}>TOP GENRES</h6>
                                                <div className="d-flex flex-column">
                                                    {Array.from(data.genres.keys()).slice(0, 5).map((genre, i) => {
                                                        return (
                                                            <p key={i} className="d-sm-block text-truncate" style={{ ...styles.textItem, ...styles.genreText }}><b>{i + 1}</b>&nbsp;&nbsp;{genre}</p>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ bottom: 0, position: 'absolute', width: '100%', textAlign: 'center' }} className="row justify-content-center">
                                            <p style={{ marginLeft: 20 }}><small style={{ color: '#a6a6a6', fontSize: 10 }}>Swipe right to add to playlist &#8594;</small></p>
                                        </div>
                                    </div>

                                    <div id="main" style={styles.button_panel}>
                                        <div style={{ height: '100%' }} className="d-flex align-items-end justify-content-center">
                                            <button id="playlistBtn" onClick={this.addToPlaylist} className="login-btn">Add to playlist</button>
                                        </div>
                                    </div>
                                </ReactSwipe>

                            </div>

                        </div>
                    </div>


                    <div id="footer" style={{ backgroundColor: main_color }} className="fixed-bottom share-footer d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                            <p style={styles.footerTag}>#WRAPPEDWHENEVER</p>
                        </div>
                        <a href="#" onClick={this.updateTermCount} className="term-select" style={{ fontSize: 14 }}>{this.state.data[this.state.termCount % 3].label}</a>
                    </div>
                    <Toaster />
                </div>
                <div className="d-sm-none d-md-block 	d-md-none d-lg-block">
                    <div className="container" style={{ marginTop: 20, paddingBottom: 60 }}>
                        <div className="row">
                            <div className="col-sm">
                                <div className="d-flex flex-row justify-content-between">
                                    <h1 style={{ color: '#fff', fontWeight: 700, paddingBottom: 15 }}>Top Tracks</h1>
                                </div>

                                {TrackList}
                            </div>
                            <div className="col-sm">
                                <div className="d-flex flex-row justify-content-between">
                                    <h1 style={{ color: '#fff', fontWeight: 700, paddingBottom: 15 }}>Top Artists</h1>
                                </div>

                                {Artists}
                            </div>

                            <div className="col-sm ">
                                <h1 style={{ color: '#fff', fontWeight: 700, paddingBottom: 15 }}>Top Genres</h1>
                                {Genres}
                            </div>
                        </div>
                    </div>
                    <div id="footer" style={{ backgroundColor: main_color }} className="fixed-bottom share-footer d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                            <p style={styles.footerTag}>#WRAPPEDWHENEVER</p>
                        </div>
                        <a href="#" onClick={this.updateTermCount} className="term-select" style={{ fontSize: 14 }}>{this.state.data[this.state.termCount % 3].label}</a>
                    </div>
                </div>

            </div>
        )
    }
}

export default Callback;