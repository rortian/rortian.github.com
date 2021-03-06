function ComplexNumber(x,y){
  this.x = x;
  this.y = y;
}

ComplexNumber.prototype = {
  plus:function(z){
    return new ComplexNumber(z.x + this.x,z.y + this.y);
  },
  minus:function(z){
    return new ComplexNumber(this.x - z.x,this.y - z.y);
  },
  times:function(z){
    return new ComplexNumber(this.x*z.x-this.y*z.y,this.x*z.y+this.y*z.x);
  },
  scalar_times:function(s){
    return new ComplexNumber(s*this.x,s*this.y);
  },
  conj:function(z){
    return new ComplexNumber(this.x,-this.y);
  },
  bignorm:function(){
    return this.x*this.x+this.y*this.y;
  },
  norm:function(){
    return Math.sqrt(this.bignorm());
  },
  inverse:function(){
    var reduce = this.bignorm();
    return new ComplexNumber(this.x/reduce,-this.y/reduce);
  },
  unit:function(){
    return this.scalar_times(1/this.norm());
  },
  power:function(n){
    switch(n){
      case 0:
        return new ComplexNumber(1,0);
      case 1:
        return this;
      case 2:
        return this.times(this);
      case 3:
        var sq = this.times(this);
        return sq.times(this);
      case 4:
        var sq = this.times(this);
        return sq.times(sq);
    }
    return this.power(4).times(this.power(n-4));
  }
}
var one = new ComplexNumber(1,0);
var i = new ComplexNumber(0,1);
var oneone = one.plus(i);
var oneminus = one.minus(i);

function Mapper(l,m,n){
  this.m = m;
  this.n = n;
  this.lambda = l;
  this.same = (m == n);
}


Mapper.prototype = {
  step:function(inc){
    if(this.same){
      var raised = inc.power(this.n);
      return raised.plus(this.lambda.times(raised.inverse()));
    } else {
      mth = inc.power(this.m);
      nth = inc.power(this.n);
      return mth.plus(this.lambda.times(nth.inverse()));
    }
  },
  escape:function(inc,max){
    var times = 0;
    var temp = inc;
    while(temp.bignorm()<9){
      temp = this.step(temp);
      times++;
      if(times==max)
        return max;
    }
    return times;
  }
}

PointGrid = function(x,y,x_start,x_final,y_start,y_final){
  this.x = x;
  this.y = y;
  this.x_start = x_start;
  this.x_final = x_final;
  this.y_start = y_start;
  this.y_final = y_final;
}

PointGrid.prototype = {
  apply:function(map){
    var points = this.raw();
    var ret = [];
    for(var i = 0;i<this.x;i++){
      ret[i] = [];
      for(var j = 0;j<this.y;j++){
        ret[i][j] = map.escape(points[i][j],50);
      }
    }
    return ret;
  },
  raw:function(){
    var delta = (1.0*(this.x_final - this.x_start))/(this.x - 1);
    var ret = [];
    for(var i = 0;i<this.x;i++){
      ret[i] = [];
      for(var j = 0;j<this.y;j++){
        ret[i][j] = new ComplexNumber(this.x_start+i*delta,
          this.y_final-j*delta);
      }
    }
    return ret;
  },
  coords:function(){
    var ret = [];
    var raw = this.raw();
    for(var i in raw){
      var i_int = parseInt(i);
      for(var j in raw[i]){
        ret.push([i_int,parseInt(j)]);
      }
    }
    return ret;
  }
}

mappy = new Mapper(new ComplexNumber(1e-6,0),3,2);

pointy = new PointGrid(30,30,-1.5,1.5,-1.5,1.5);

Greedy = function(grid){
  this.grid = grid;
  this.placed = this.allfalse();
  this.groups = {};
  this.directions = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]];
  this.decompose();
}

Greedy.prototype = {
  decompose:function(){
    for(var i = 0;i<this.placed.length;i++){
      for(var j = 0;j<this.placed[i].length;j++){
        if(!this.placed[i][j]){
          this.group(i,j);
        }
      }
    }
  },
  allfalse:function(){
    var ret = [];
    for(var i = 0;i<this.grid.length;i++){
      ret[i] = [];
      for(var j = 0;j<this.grid[i].length;j++){
        ret[i][j] = false;
      }
    }
    return ret;
  },
  group:function(x,y){
    var criteria = this.grid[x][y];
    this.visited = this.allfalse();
    if(!this.groups[criteria]){
      this.groups[criteria] = [];
    }
    var members = [[x,y]];
    this.placed[x][y] = true;
    this.visited[x][y] = true;
    for(var d in this.directions){
      var current = this.directions[d];
      if(this.valid_search(x+current[0],y+current[1])){
        members = members.concat(this.friends(x+current[0],y+current[1],criteria));
      }
    }
    this.groups[criteria].push(members);
  },
  friends:function(x,y,criteria){
    this.visited[x][y] = true;
    var ret = [];
    if(this.grid[x][y] == criteria){
      if(this.placed == true){
        console.log("Weird not yet visited but placed");
        console.log("x: "+x+" y: "+y);
      }
      ret = [[x,y]];
      this.placed[x][y] = true;
      for(var d in this.directions){
        var current = this.directions[d];
        if(this.valid_search(x+current[0],y+current[1])){
          ret = ret.concat(this.friends(x+current[0],y+current[1],criteria));
        }
      }
    }
    return ret;
  },
  valid_search:function(x,y){
    if(this.placed[x] == undefined){
      return false;
    }
    if(this.placed[x][y] == undefined){
      return false;
    }
    return !this.visited[x][y];
  },
  optimize:function(){
    var ret = []
    for(var x in this.groups){
      var current = this.groups[x];
      for(var y in current){
        ret.push(new Group(current[y]))
      }
    }
    return ret;
  }
}

ascending = function(a,b){ return (a-b) }

Group = function(members){
  this.friends = []
  for(var c in members){
    var current = members[c];
    if(!this.friends[current[0]]){
      this.friends[current[0]] = []
    }
    this.friends[current[0]][current[1]] = true;
  }

  this.stats();

}

Group.prototype = {
  stats:function(){
    this.x_max = this.friends.length - 1;
    this.y_min = this.friends.length + 1000;
    this.y_max = -1;
    for(var x_i in this.friends){
      if(!this.x_min && this.x_min != 0){
        this.x_min = parseInt(x_i);
      }
      for(var y_i in this.friends[x_i]){
        if(y_i < this.y_min){
          this.y_min = parseInt(y_i);
        }
        if(y_i > this.y_max){
          this.y_max = parseInt(y_i);
        }
      }
    }
  },
  area:function(){
    return (this.x_max - this.x_min)*(this.y_max - this.y_min);
  },
  width:function(){
    return (this.x_max - this.x_min) + 1;
  },
  height:function(){
    return (this.y_max - this.y_min) + 1;
  }
}

greedy = new Greedy(pointy.apply(mappy));

var groups = greedy.optimize();

var dist = {};

for(var g in groups){
  var area = groups[g].area();
  if(!dist[area]){
    dist[area] = 1;
  } else {
    dist[area] = dist[area] + 1;
  }
}
