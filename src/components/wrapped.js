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
                "#2CA6A4",
                "#DB6D2F",
                "#1DB954",
                "#AE242A",
                "#6761A8"
            ],
            color: "",
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

        const min = Math.ceil(0)
        const max = Math.ceil(this.state.colors.length - 1)
        const colorIdx = Math.floor(Math.random() * (max - min + 1)) + min
        console.log(colorIdx)
        const footerHeight = document.getElementById("footer").clientHeight
        this.setState({color: colorIdx, footerHeight: footerHeight})
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
                <div className="d-flex flex-row" style={{paddingBottom: 10}}>
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
                <div className="d-flex flex-row" style={{paddingBottom: 10}}>
                    <img alt={i} src={artist.images[2].url} height="64" width="64" className="square-img"/>
                    <div className="d-flex flex-column justify-content-center ps-3">
                        <b>{artist.name}</b>
                    </div>
                </div> 
            )
        })
    
        const main_card_height = window.innerHeight - this.state.footerHeight - 40;
        const main_color = this.state.colors[this.state.color]
        return (
            <div>
                {
                    this.state.loading ?
                        <div className="d-flex flex-row" style={{minHeight: '100%', width:'100%'}}>
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    :
                    <div className="container">
                        <div className="row">
                            <div style={{padding:20}} className="col-sm d-md-none d-lg-none d-xl-none d-xxl-none d-lg-block d-xl-block">
                                <div id="main" style={{backgroundColor: main_color, height: main_card_height}}>
                                    <div className="parent perspective" style={{marginLeft: 350}}>
                                        {this.state.top_tracks.slice(0, 5).map((track, i) => {
                                            
                                            const offset = i * 40;
                                            const index = 5 - i;
                                            return(
                                                <img alt={i} id="track" style={{right:offset, zIndex:index}} src={track.album.images[1].url} height="190" width="190" className="square-img child"/>
                                            )
                                        })}
                                    </div>
                                    <div className="container-sm">
                                        <div className="row" style={{marginTop:210}}>
                                            <div className="col">
                                                <h6 style={{fontWeight:700}}>TOP ARTISTS</h6>
                                                {this.state.top_artists.slice(0,5).map((artist, i) => {
                                                    return(
                                                        <div><p className="d-block text-truncate" style={{marginBottom: -3, fontSize: 14, maxWidth: 140}}><b>{i + 1}</b>&nbsp;&nbsp;{artist.name}</p></div>
                                                    )
                                                })}
                                            </div>
                                            <div className="col">
                                                <h6 style={{fontWeight:700}}>TOP SONGS</h6>
                                                {this.state.top_tracks.slice(0,5).map((track, i) => {
                                                    return(
                                                        <div><p className="d-block text-truncate" style={{marginBottom: -3, fontSize: 14, maxWidth: 130}}><b>{i + 1}</b>&nbsp;&nbsp;{track.name}</p></div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className="row" style={{marginTop: 20}}>
                                            <h6 style={{fontWeight:700, textAlign:'center'}}>TOP GENRES</h6>
                                            <div className="d-flex flex-column">
                                                {Array.from(this.state.genres.keys()).slice(0,5).map((genre, i) => {
                                                    return(
                                                        <p className="d-sm-block text-truncate" style={{marginBottom: 0, fontSize: 14}}><b>{i + 1}</b>&nbsp;{genre}</p>
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
                }
                
                <div id="footer" style={{backgroundColor: main_color}} className="fixed-bottom share-footer d-flex flex-row justify-content-between align-items-center">
                    <p style={{marginBottom: 0, fontWeight:600, fontSize: 14}}>#WRAPPEDWHENEVER</p>
                    <a href="#" onClick={this.updateTermCount} className="term-select" style={{fontSize:14}}>{this.state.termLabels[this.state.termCount % 3]}</a>
                </div>
            </div>
        )
    }
}

export default Callback;