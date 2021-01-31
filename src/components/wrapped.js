import React from 'react'
import superagent from 'superagent'

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

function getCssValuePrefix()
{
    var rtrnVal = '';//default to standard syntax
    var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];

    // Create a temporary DOM object for testing
    var dom = document.createElement('div');

    for (var i = 0; i < prefixes.length; i++)
    {
        // Attempt to set the style
        dom.style.background = prefixes[i] + 'linear-gradient(#000000, #ffffff)';

        // Detect if the style was successfully set
        if (dom.style.background)
        {
            rtrnVal = prefixes[i];
        }
    }

    dom = null;
    console.log(rtrnVal)
    return rtrnVal;
}

class Callback extends React.Component {
    constructor(props) {
        super(props)

        var params = getHashParams();
        this.state = {
            access_token: params.access_token,
            top_artists: [],
            top_tracks: [],
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
                "linear-gradient(0.13deg, #72C6EF 0.11%, #004E8F 99.89%)",
                "linear-gradient(0deg, #EC008C 0%, #FC6767 100%)",
                "linear-gradient(10.8deg, #FF6E7F 2.8%, #BFE9FF 98.38%)",
                "linear-gradient(4.8deg, #DA22FF 5.89%, #9733EE 95.62%)",
                "linear-gradient(0.03deg, #CC95C0 1.38%, #DBD4B4 50.68%, #7AA1D2 99.97%)",
                "linear-gradient(0.15deg, #E55D87 0.13%, #5FC3E4 99.88%)"
            ],
            footerHeight: 0,
            termCount: 0,
            genres: new Map(),
            validToken: true,
            loading: true
        }

        this.getTopItems = this.getTopItems.bind(this)
        this.updateTracks = this.updateTracks.bind(this)
        this.getArtistInfo = this.getArtistInfo.bind(this)
        this.getGenres = this.getGenres.bind(this)
        this.redirectToHome = this.redirectToHome.bind(this)
        this.updateTermCount = this.updateTermCount.bind(this)
        this.updateValues = this.updateValues.bind(this)
    }
    updateTracks(term) {
        this.getTopItems("tracks", term, 50)
        .then((res) => {
            this.setState({top_tracks: res.body.items})
        })
        .catch((err) => {
            if(err.status === 401){
                console.log(err.status)
                this.setState({validToken: false})
                this.redirectToHome()
            }  
        })

        this.getTopItems("tracks", term, 50, 49)
        .then((res) => {
            let updatedTracks = new Object(this.state.top_tracks)
            updatedTracks.push(...res.body.items.slice(1))
            this.setState({top_tracks: updatedTracks}, this.getGenres)
        })
        .catch((err) => {
            if(err.status === 401){
                console.log(err.status)
                this.setState({validToken: false})
                this.redirectToHome()
            }  
        })
    }
    updateTermCount() {
        this.setState({loading:true, termCount: this.state.termCount + 1}, this.updateValues);
    }
    updateValues() {
        
        const term = this.state.terms[this.state.termCount % 3]
        this.updateTracks(term)

        this.getTopItems("artists", term)
        .then((res) => {
            this.setState({top_artists: res.body.items, loading: false})
        })
        .catch((err) => {
            if(err.status === 401){
                console.log(err.status)
                this.setState({validToken: false})
                this.redirectToHome()
            }            
        }) 
    }
    componentDidMount() {
        // set top tracks
        this.updateValues()

        const footerHeight = document.getElementById("footer").clientHeight
        this.setState({footerHeight: footerHeight})     
    }
    componentWillMount() {
        const min = Math.ceil(0)
        const max = Math.ceil(this.state.colors.length - 1)
        const colorIdx = Math.floor(Math.random() * (max - min + 1)) + min

        document.body.style.backgroundImage = this.state.colors[colorIdx];
    }
    componentWillUnmount(){
        document.body.style.backgroundImage = null;
    }
    getGenres() {
        this.state.top_tracks.forEach((track, i) => {
            this.getArtistInfo(track.artists[0].id)
            .then(res => {
                let updatedGenres = this.state.genres
                res.body.genres.forEach(genre => {
                    updatedGenres.set(genre, (updatedGenres.get(genre) || 0) + 1)         
                })
                const finalGenres = new Map([...updatedGenres.entries()].sort((a, b) => b[1] - a[1]));
                this.setState({genres:finalGenres})
            })
            .catch(err => {
                console.log(err)
                this.redirectToHome()
            })
        })
    }
    async getArtistInfo(artistId) {
        return superagent.get(`https://api.spotify.com/v1/artists/${artistId}`)
        .set("Authorization", "Bearer " + this.state.access_token)
    }
    async getTopItems(item, term) {
        return superagent.get(`https://api.spotify.com/v1/me/top/${item}`)
        .query({ time_range: term})
        .set("Authorization", "Bearer " + this.state.access_token)
    }
    async getTopItems(item, term, limit, offset) {
        return superagent.get(`https://api.spotify.com/v1/me/top/${item}`)
        .query({ time_range: term})
        .query({ limit: limit})
        .query({ offset: offset})
        .set("Authorization", "Bearer " + this.state.access_token)
    }
    redirectToHome() {
        if(process.env.NODE_ENV === "production") {
            window.location = "https://wrappedwhenever.herokuapp.com/"
        } else {
            window.location = "http://localhost:3000"
        }
    }
    render() {
          
        const Genres = Array.from(this.state.genres.keys()).slice(0,5).map((genre, i) => {
            return (
                <li key={i} style={{textTransform: 'capitalize'}}>{genre}</li>
            )
        })

        const TrackList = this.state.top_tracks.slice(0, 20).map((track, i) => {
            let artists = ""
            track.artists.forEach((artist, i) => {
                artists += (i === track.artists.length - 1) ? `${artist.name}` : `${artist.name}, `
            });
            return (
                <div key={i} className="d-flex flex-row" style={{paddingBottom: 10}}>
                    <img alt={i} src={track.album.images[2].url} height="64" width="64" className="square-img"/>
                    <div className="d-flex flex-column justify-content-center ps-3">
                        <b>{track.name}</b>
                        <small>{artists}</small>
                    </div>
                </div>
            )
        })
        const Artists = this.state.top_artists.map((artist, i) => {
            return (
                <div key={i} className="d-flex flex-row" style={{paddingBottom: 10}}>
                    <img alt={i} src={artist.images[2].url} height="64" width="64" className="square-img"/>
                    <div className="d-flex flex-column justify-content-center ps-3">
                        <b>{artist.name}</b>
                    </div>
                </div> 
            )
        })
    
        const main_card_height = window.innerHeight - this.state.footerHeight - 40;
        const main_color = '#181818'
        return (
            <div>
                <div className="container">
                    <div className="row">
                        <div style={{padding:20}} className="col-sm d-md-none d-lg-none d-xl-none d-xxl-none d-lg-block d-xl-block">
                            <div id="main" style={{backgroundColor: main_color, height: main_card_height, borderRadius: 10}}>
                                <div className="parent perspective" style={{marginLeft: 350}}>
                                    {this.state.top_tracks.slice(0, 5).map((track, i) => {
                                        
                                        const offset = i * 40;
                                        const index = 5 - i;
                                        return(
                                            <img key={i} alt={i} id="track" style={{right:offset, zIndex:index}} src={track.album.images[1].url} height="190" width="190" className="square-img child"/>
                                        )
                                    })}
                                </div>
                                <div className="container-sm">
                                    <div className="row" style={{marginTop:210}}>
                                        <div className="col">
                                            <h6 style={{fontWeight:700}}>TOP ARTISTS</h6>
                                            {this.state.top_artists.slice(0,5).map((artist, i) => {
                                                return(
                                                    <div key={i}><p className="d-block text-truncate" style={{marginBottom: -4, fontSize: 12, maxWidth: 140}}><b>{i + 1}</b>&nbsp;&nbsp;{artist.name}</p></div>
                                                )
                                            })}
                                        </div>
                                        <div className="col">
                                            <h6 style={{fontWeight:700}}>TOP SONGS</h6>
                                            {this.state.top_tracks.slice(0,5).map((track, i) => {
                                                return(
                                                    <div key={i}><p className="d-block text-truncate" style={{marginBottom: -4, fontSize: 12, maxWidth: 140}}><b>{i + 1}</b>&nbsp;&nbsp;{track.name}</p></div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="row" style={{marginTop: 20}}>
                                        <h6 style={{fontWeight:700, textAlign:'center'}}>TOP GENRES</h6>
                                        <div className="d-flex flex-column">
                                            {Array.from(this.state.genres.keys()).slice(0,5).map((genre, i) => {
                                                return(
                                                    <p key={i} className="d-sm-block text-truncate" style={{marginBottom: -4, fontSize: 12}}><b>{i + 1}</b>&nbsp;{genre}</p>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>                    
                            </div>
                        </div>
                        <div className="col-sm d-none d-sm-none d-sm-block d-md-block">
                            <div className="d-flex flex-row justify-content-between">
                                <h1>Top Artists</h1>
                            </div>

                            {Artists}
                        </div>
                        <div className="col-sm d-none d-sm-none d-sm-block d-md-block">
                            <h1>Top Genres</h1>
                            <ol style={{fontSize:24}}>
                                {Genres}
                            </ol>
                        </div>
                    </div>
                </div>
                
                <div id="footer" style={{backgroundColor: main_color}} className="fixed-bottom share-footer d-flex flex-row justify-content-between align-items-center">
                    <p style={{marginBottom: 0, fontWeight:600, fontSize: 14}}>#WRAPPEDWHENEVER</p>
                    <a href="#" onClick={this.updateTermCount} className="term-select" style={{fontSize:14}}>{this.state.termLabels[this.state.termCount % 3]}</a>
                </div>
            </div>
        )
    }
}

export default Callback;