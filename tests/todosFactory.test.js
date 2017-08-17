describe("Todo factory", function() {
    beforeEach(module('todolijst'));
    var todos;



    beforeEach(angular.mock.module('todolijst'));

   
       
        
           var td = {id:"598da3e55ebc010c3822ed4a",name:"met de hondjes gaan wandelen",author:"ben",completed:false,note:"",_v:0};
        
    


    beforeEach(inject(function(_todos_) {
    todos = _todos_;
  }));


  it("should exist", function(){
      expect(todos).toBeDefined();
      
  })

  it("getAll should have been called", function(){
      spyOn(todos,'getAll');
      todos.getAll();
      expect(todos.getAll).toHaveBeenCalled();
  })



})