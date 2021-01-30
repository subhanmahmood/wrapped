import React, { useEffect } from 'react'
import superagent from 'superagent'
import Select from 'react-select'

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
            term: 'short_term',
            genres: new Map(),
            validToken: true
        }

        this.getTopItems = this.getTopItems.bind(this)
        this.handleTrackTermChange = this.handleTrackTermChange.bind(this)
        this.handleArtistTermChange = this.handleArtistTermChange.bind(this)
        this.updateTracks = this.updateTracks.bind(this)
        this.getArtistInfo = this.getArtistInfo.bind(this)
        this.getGenres = this.getGenres.bind(this)
        this.redirectToHome = this.redirectToHome.bind(this)
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
    componentDidMount() {
        // set top tracks
        this.updateTracks(this.state.term)

        // set top artists
        this.getTopItems("artists", "short_term")
        .then((res) => {
            this.setState({top_artists: res.body.items})
        })
        .catch((err) => {
            if(err.status === 401){
                console.log(err.status)
                this.setState({validToken: false})
                this.redirectToHome()
            }            
        }) 
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
    handleTrackTermChange(data){
        this.updateTracks(data.value)
    }
    redirectToHome() {
        if(process.env.NODE_ENV === "production") {
            window.location = "https://wrappedwhenever.herokuapp.com/"
        } else {
            window.location = "http://localhost:3000"
        }
    }
    handleArtistTermChange(data) {

        this.getTopItems("artists", data.value)
        .then((res) => {
            this.setState({top_artists: res.body.items})
        })
        .catch((err) => {
            if(err.status === 401){
                console.log(err.status)
                this.setState({validToken: false})
                this.redirectToHome()
            }            
        }) 
    }
    render() {
          
        const options = [
            { value: 'short_term', label: 'Last month' },
            { value: 'medium_term', label: 'Last 6 months' },
            { value: 'long_term', label: 'All time' }
        ]

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
                    <img src={track.album.images[2].url} height="64" width="64" className="square-img"/>
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
                    <img src={artist.images[2].url} height="64" width="64" className="square-img"/>
                    <div className="d-flex flex-column justify-content-center ps-3">
                        <b>{artist.name}</b>
                    </div>
                </div> 
            )
        })
        
        return (
            <div>
                <div className="container" style={{paddingTop:30}}>
                    <div className="row">
                        <div className="col-sm">
                            <div className="d-flex flex-row justify-content-between">
                                <h1 style={{fontWeight:800}}>Top Tracks</h1>
                                <div style={{width:150}}>
                                    <Select defaultValue={{value: 'short_term', label: 'Last month'}} onChange={this.handleTrackTermChange} options={options} styles={{width: 50}}/>
                                </div>
                            </div>
                            <div className="parent perspective">
                                {this.state.top_tracks.slice(0, 5).map((track, i) => {
                                    
                                    const offset = i * 40;
                                    const index = 5 - i;
                                    return(
                                        <img id="track" style={{right:offset, zIndex:index}} src={track.album.images[1].url} height="240" width="240" className="square-img child"/>
                                    )
                                })}
                            </div>
                            <div className="row" style={{marginTop:300}}>
                                <div className="col">
                                    {this.state.top_tracks.slice(0,5).map((track, i) => {
                                        return(
                                            <div><p style={{marginBottom: 0, fontSize: 14}}><b>{i + 1}</b>&nbsp;{track.name}</p></div>
                                        )
                                    })}
                                </div>
                                <div className="col">
                                    {this.state.top_artists.slice(0,5).map((artist, i) => {
                                        return(
                                            <div><p style={{marginBottom: 0, fontSize: 14}}><b>{i + 1}</b>&nbsp;{artist.name}</p></div>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            <div >
                                {TrackList}
                            </div>                     
                            
                        </div>
                        <div className="col-sm">
                            <div className="d-flex flex-row justify-content-between">
                                <h1>Top Artists</h1>
                                <div style={{width:150}}>
                                    <Select defaultValue={{value: 'short_term', label: 'Last month'}} onChange={this.handleArtistTermChange} options={options} styles={{width: 50}}/>
                                </div>
                            </div>

                            {Artists}
                        </div>
                        <div className="col-sm">
                            <h1>Top Genres</h1>
                            <ol style={{fontSize:24}}>
                                {Genres}
                            </ol>
                        </div>
                    </div>
                </div>
                <div className="fixed-bottom share-footer">
                    <p style={{marginBottom: 0, fontWeight:600}}>#WRAPPEDWHENEVER</p>
                </div>
            </div>
        )
    }
}

export default Callback;