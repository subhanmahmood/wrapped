import React from 'react';
import superagent from 'superagent';

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

class Home extends React.Component {
    constructor(props){
        super(props);

        let redirect_uri = ""
        if(process.env.NODE_ENV === 'production') {
            redirect_uri = 'https://www.wrappedwhenever.com/wrapped'
        } else {
            redirect_uri = 'http://localhost:3000/wrapped'
        }
        this.state = {
            client_id: "3489a6bba8dd4575a5895e3e4dc75e5c",
            redirect_uri: redirect_uri,
            scope: "user-top-read",
            state: generateRandomString(16)
        }
        
        this.handleAuthClick = this.handleAuthClick.bind(this)
    }
    componentDidMount() {
        const body = document.querySelector("body")
        body.style.background = "#181818"
    }
    handleAuthClick(event) {
        var url = 'https://accounts.spotify.com/authorize';
            url += '?response_type=token';
            url += '&client_id=' + encodeURIComponent(this.state.client_id);
            url += '&scope=' + encodeURIComponent(this.state.scope);
            url += '&redirect_uri=' + encodeURIComponent(this.state.redirect_uri);
            url += '&state=' + encodeURIComponent(this.state.state);

        event.preventDefault();
        window.location = url 
    }
    render(){
        return(
            <div>
                <div className="header-container">
                    <p className="header-small">YOUR</p>
                    <h1 className="header">Wrapped,<br/>Whenever</h1>
                </div>
                <div className="d-flex flex-row justify-content-center fixed-bottom">
                    <button onClick={this.handleAuthClick} className="login-btn">Login with Spotify</button>   
                </div>
                
            </div>
        )
    }
}

export default Home;