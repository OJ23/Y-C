(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          console.log("🧪 SUBMIT TRIGGERED");
          event.preventDefault();
          event.stopPropagation();
        }
  
        form.classList.add('was-validated')
      }, false) 
    });
  })();


//   (() => {
//   'use strict'

//   const forms = document.querySelectorAll('.needs-validation');

//   Array.from(forms).forEach(form => {
//     form.addEventListener('submit', event => {
//       if (!form.checkValidity()) {
//         event.preventDefault();
//         event.stopPropagation();
//       } 
//       // ✅ DO NOT block the form if it's valid — just add the class
//       form.classList.add('was-validated');
//     }, false);
//   });
// })();
