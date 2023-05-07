import navbar from './navbar.js'

export default{
    template:`
    <div>
    <navbar/> 
    <div class="mx-4 my-3">
    <br> 
    
    <img :src="'static/user_profile_pics/'+account_data.profile_picture" class="rounded" alt="..." width="200px" height="200px">
  
    <br> <br>
  

    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="floatingInputDisabled" placeholder="name@example.com" disabled>
      <label for="floatingInputDisabled">{{account_data.name}}</label>    
    </div>

    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="floatingInputDisabled" placeholder="name@example.com" disabled>
      <label for="floatingInputDisabled">{{account_data.email}}</label>    
    </div>

    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="floatingInputDisabled" placeholder="name@example.com" disabled>
      <label for="floatingInputDisabled">{{account_data.password}}</label>    
    </div>
    

  
 <div class = "row"> <!--BUTTON ROW STARTS-->
    <!--EDIT BUTTON MODAL-->

<!-- Button trigger modal -->
<div class="col-auto">
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
  Edit
</button>
</div>

<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

        <div class="my-3">
        <label> Name: </label>
        <input type="text" v-model="name">
        </div>

        <div class="my-3">
        <label> Password: </label>
        <input type="text" v-model="password">
        </div>

        <div class="my-3">
        <label> Image: </label>
        <input type="file" class="form-control-file" id="exampleFormControlFile1" @change="file_uploaded">
        </div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" @click="update_account" class="btn btn-primary" data-bs-dismiss="modal">Update</button>
      </div>
    </div>
  </div>
</div>


<!--EDIT BUTTON MODEL ENDS-->












<!--DELETE BUTTON MODAL-->

<!-- Button trigger modal -->
<div class="col-auto">
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#deleteModal">
  Delete
</button>
</div>

<!-- Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

        <div class="my-3">
        <label> Are you sure you want to delete your account? </label>
        </div>


      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" @click="delete_account" class="btn btn-primary" data-bs-dismiss="modal">Delete</button>
      </div>
    </div>
  </div>
</div>

<!--DELETE BUTTON MODEL ENDS-->
</div> <!--BUTTON ROW ENDS-->









    
    </div>
    </div>
    `,
    mounted:function(){
      document.title = "Account Details"
      fetch('http://127.0.0.1:5000/api/getuserdetails').then(response=>response.json()).then(response1=>{console.log(response1)
        this.account_data=response1[0]})
    },
  components:{
      navbar,
   },
   data:function(){
    return{
      email:null,
      name:null,
      password:null,
      image:null,
      account_data:[],
    }
   },
   methods: {
    file_uploaded(event){
      this.image = event.target.files[0]
    },
    
    update_account(){
        const form_data = new FormData()

        form_data.append("name", this.name)
        form_data.append("password", this.password)
        form_data.append("image", this.image)
        fetch('http://127.0.0.1:5000/api/edit_account', {
        method:"PUT",
        body: form_data,
      }).then(response => response.json()).then(response1 => 
        console.log(response1),
        location.reload())      
    },

    delete_account(){
      fetch('http://127.0.0.1:5000/api/edit_account', {
      method:"DELETE",
    }).then(response => response.json()).then(response1 => console.log(response1), localStorage.removeItem('authentication-token'), this.$router.push("/login"))      
  },

   }
  }