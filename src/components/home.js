import React from 'react';


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
            client_id: "97d84be4746b4a5886291bf732c0bc44",
            redirect_uri: redirect_uri,
            scope: "user-top-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative",
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