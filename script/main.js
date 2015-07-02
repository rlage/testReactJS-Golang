/*var CustomButton = React.createClass({
  handleClick: function(e){

  },
  render: function() {
    return (
      <button className="btn btn-success pull-left"> Comprar </button>
    );
  }
});

React.render(
  <CustomButton onClick={this.handleClick}/>,
  document.getElementById('buy-button-container')
);*/

var DevList = React.createClass({
  handleOnHourChange: function(dev){
    this.props.onHourChange(dev);
    return;
  },
  render: function() {
    var devNodes = this.props.data.map(function (developer) {
      return (
        <Developer onHourChange={this.handleOnHourChange} name={developer.name} price={developer.price} hours={developer.hours}>
        </Developer>
      );
    });
    return (
      <tbody className="devList">
        {devNodes}
      </tbody>
    );
  }
});

var Developer = React.createClass({
  addRemoveButton: function(){
    if($("#confirm").html().trim()==""){
      return <td><button className="btn btn-danger pull-right">Remove</button></td>;
    }
  },
  handleChange: function(e){
    console.log(this.props);
    var dev = {name: this.props.name, price: this.props.price, hours: e.target.value};
    var params = {action: "change", data:dev}
    $.ajax({
      url: "../cart.json",
      dataType: 'json',
      type: 'POST',
      data: params,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    return;
  },

  disable: function(){
    if($("#confirm").html().trim()==""){
      return false;
    } else {
      return true;
    }
  },
  render: function() {
    return (
      <tr className="product">
        <td>{this.props.name}</td>
        <td>{this.props.price}</td>
        <td><input onChange={this.handleChange} className="hours" type="number" defaultValue={this.props.hours} min="1" max="500" disabled={this.disable()}/></td>
        {this.addRemoveButton()}
      </tr>
    );
  }
});

var DevCart = React.createClass({
  handleOnHourChange: function(dev){
    this.props.onHourChange(dev);
    return;
  },
  render: function() {
    return (
      <div className="cart row">
        <h2>Cart</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Price</th>
              <th>Hours</th>
              <th></th>
            </tr>
          </thead>
          <DevList onHourChange={this.handleOnHourChange} data={this.props.data} />
        </table>
      </div>
    );
  }
});

var DevSummary = React.createClass({
  handleClick: function(e){
    this.props.onDevPurchase(this.props.data);
    return;
  },
  calculateTotal: function(){
    var data = this.props.data;
    var hours = $(".hours");
    var total = 0;
    for(i in data){
      if(hours.length > 0){
        total += parseInt(data[i].price.slice(1)) * parseInt(hours[i].value);
      } else {
        total += parseInt(data[i].price.slice(1));
      }
    }
    return total;
  },
  addPurchaseButton: function(){
    if($("#confirm").html().trim()==""){
      return <td><button onClick={this.handleClick} className="btn btn-success pull-left"> Comprar </button></td>;
    }
  },
  render: function() {
    return (
      <div className="totalizer row">
        <div className="col-sm-5">
          <div className="row">
            <table className="table">
              <tbody>
                <tr className="total">
                  <td>Total</td>
                  <td id="total">${this.calculateTotal()}</td>
                  {this.addPurchaseButton()}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
});

var DevForm = React.createClass({
  handleSubmit: function(e){
    e.preventDefault();
    var name = React.findDOMNode(this.refs.name).value.trim();
    var price = React.findDOMNode(this.refs.price).value.trim();
    console.log(name);
    console.log(price);
    if (!price || !name) {
      return;
    }
    this.props.onDevSubmit({name: name, price: "$"+price, hours: "1"});
    React.findDOMNode(this.refs.name).value = '';
    React.findDOMNode(this.refs.price).value = '';
    return;
  },
  render: function() {
    return (
      <div className="devBox row">
        <h2>Add a developer</h2>
        <form className="devForm form-inline" role="form" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <input type="text" className="form-control" placeholder="GitHub username" ref="name"/>
          </div>
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Price" ref="price"/>
          </div>
          <input type="submit" className="btn btn-success" value="Add" />
        </form>
      </div>
    );
  }
});

var DevConfirmBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadDevsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadDevsFromServer();
    setInterval(this.loadDevsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="container">
        <h1>Your purchase is confirmed as follows</h1>
        <DevCart data={this.state.data} />
        <DevSummary data={this.state.data}/>
        <h2>You should receive an email shortly.</h2>
      </div>
    );
  }
});

var DevShopBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadDevsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleDevSubmit: function(dev) {
    console.log(this.props.url);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: dev,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleDevPurchase: function(devs) {
    $("#content").hide();
    React.render(
      <DevConfirmBox url="../cart.json" pollInterval={2000}/>,
      document.getElementById('confirm')
    );
  },
  handleHourChange: function(dev) {
    console.log("dev shop box");
    console.log(dev);
  },
  componentDidMount: function() {
    this.loadDevsFromServer();
    setInterval(this.loadDevsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="container">
        <h1>Dev Shop</h1>
        <DevForm onDevSubmit={this.handleDevSubmit}/>
        <DevCart onHourChange={this.handleHourChange} data={this.state.data} />
        <DevSummary onDevPurchase={this.handleDevPurchase} data={this.state.data}/>
      </div>
    );
  }
});
React.render(
  <DevShopBox url="../cart.json" pollInterval={2000}/>,
  document.getElementById('content')
);
