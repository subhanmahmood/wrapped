import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './components/home';
import Wrapped from './components/wrapped'

function App() {
  return (
    <Switch>
      <Route path="/" exact component={Home}/>
      <Route path="/wrapped" exact component={Wrapped}/>
    </Switch>
  );
}


export default App;
