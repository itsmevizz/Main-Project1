
function addToCart(proId) {
  $.ajax({
    url: "/add-to-cart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#carrt-count").html();
        count = parseInt(count) + 1;
        $("#carrt-count").html(count);
      } else {
        window.location.href = "/user-login";
      }
    },
  });
}

function changeQuantity(cartId, ProId, userId, count) {
  let quantity = parseInt(document.getElementById(ProId).innerHTML);
  if (quantity+count==0) {
    removeItem(cartId,ProId)
  }else{

    console.log(quantity);
    $.ajax({
      url: "/change-product-quantity",
      data: {
        user: userId,
        cart: cartId,
        product: ProId,
        count: count,
      },
      method: "post",
      success: (response) => {
        // if (response) {
        //   if(quantity+count <= 1){
        //     $(ProId1).hide()
        //   }else{
        //     $(ProId1).show()
        //   }
          document.getElementById(ProId).innerHTML = quantity + count;
          document.getElementById("totalAmt").innerHTML = response.totalAmt;
          document.getElementById("totalAll").innerHTML = response.amountPayable;
        // }
      },
    });
  }
}

function removeItem(cartId, ProId) {
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/remove-from-cart",
        data: {
          cart: cartId,
          product: ProId,
        },
        method: "post",
        success: (response) => {
          if (response.removeProduct) {
            Swal.fire(
              "Deleted!",
              "Your product has been deleted.",
              "success"
            ).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }
        },
      });
    }
  });
}
// address
$("#checkout-form").submit((e) => {
  console.log(e);
  e.preventDefault();
  if (validateForm(true)) {
    $.ajax({
      url: "/addNewAddress",
      method: "post",
      data: $("#checkout-form").serialize(),
      success: (response) => {
        if (response.codSuccess) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Order Placed",
            showConfirmButton: false,
            timer: 2500,
          });
          location.href = "/";
        }
      },
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please give the required",
    });
  }
});
// place order
var checkoutAddressId;
var PaymentMethod;

function selectAddress(id) {
  checkoutAddressId = id;
}
function selectPayment(payment) {
  PaymentMethod = payment;
}

function placeOrder(payableAmount, totalAmount) {
  if (!checkoutAddressId && PaymentMethod) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please Select address to Place Order",
    });
  } else if (!PaymentMethod && checkoutAddressId) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please Select payment method to Place Order",
    });
  }
  else if (!checkoutAddressId && !PaymentMethod) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please give address and payment method",
    });
  } else {
    console.log(PaymentMethod);
    $.ajax({
      url: `/payment?payment=${PaymentMethod}&addressId=${checkoutAddressId}`,
      data:{
        amount:payableAmount,
        totalAmt:totalAmount,
      },
      method: "post",
      success: (res) => {
        if (res.codSuccess) {
          location.href = '/order-placed'
        } else if(res.falspayment){
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong! Your order is pending',
            footer: ''
          })
        }
        else if (PaymentMethod === 'ONLINE') {
          console.log('Razo');
          razorpayPayment(res);
        } else {
          console.log("Paypal");
          payPalPayment(res);
        }
      },
    });
  }
}

// razorpay

function razorpayPayment(order) {
  console.log(order);
  var options = {
    key: "rzp_test_BMQyq5KAzN3eqy", // Enter the Key ID generated from the Dashboard
    amount: order.response.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Sparklein",
    description: "Test Transaction",
    image: "",
    order_id: order.response.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      varifyPayment(response, order);
    },
    prefill: {
      name: order.response.user.Name,
      email: order.response.user.Email,
      contact: order.response.user.Number,
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
}
function varifyPayment(payment, order) {
  $.ajax({
    url: "/verify-payment",
    data: {
      payment,
      order,
    },
    method: "post",
    success: (response) => {
      if (response.status) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Order Placed",
          showConfirmButton: false,
          timer: 2500,
        }).then(() => {
          location.href = "/";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Payment Failed, Select another payment method",
        }).then(() => {
          location.href = "/payment";
        });
      }
    },
  });
}

// PayPalPayment

function payPalPayment(payment) {
  for (let i = 0; i < payment.links.length; i++) {
    if (payment.links[i].rel === "approval_url") {
      location.href = (payment.links[i].href)
    }
  }
}
// // Payment success
// function paypalSuccess(){
//   console.log('Hi success');
//   location.href = "/";
// }


// Edit address
$("#editAddress-form").submit((e) => {
  console.log(e);
  e.preventDefault();
  if (validateForm(true)) {
    $.ajax({
      url: "/editAddress",
      method: "post",
      data: $("#editAddress-form").serialize(),
      success: (response) => {
        if (response.updated) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Updated successfully",
            showConfirmButton: false,
            timer: 2500,
          }).then(() => {
            location.href = "/user-profile";
          });
        }
      },
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please give the required",
    });
  }
});

// edit profile
$("#editProfile-form").submit((e) => {
  console.log(e);
  e.preventDefault();
  if (validateProfile(true)) {
    $.ajax({
      url: "/change-userProfile",
      method: "post",
      data: $("#editProfile-form").serialize(),
      success: (response) => {
        if (response.updated) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Edited successfully",
            showConfirmButton: false,
            timer: 2500,
          }).then(() => {
            location.href = "/user-profile";
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Somthing wrong please try later",
          });
        }
      },
    });
  }
});

// change password
$("#changePassword-form").submit((e) => {
  console.log(e);
  e.preventDefault();
  if (changePassword(true)) {
    $.ajax({
      url: "/change-userPassword",
      method: "post",
      data: $("#changePassword-form").serialize(),
      success: (response) => {
        if (response.updated) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Passwoer changed successfully",
            showConfirmButton: false,
            timer: 2500,
          }).then(() => {
            location.href = "/user-profile";
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Password incorrect",
          });
        }
      },
    });
  }
});


function cancelOrder(orderId) {
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/cancel-order",
        data: {
          orderId: orderId,
        },
        method: "post",
        success: (response) => {
          if (response.status) {
            Swal.fire(
              "Deleted!",
              "Your order has been canceled .",
              "success"
            ).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }else if(response.Shipped){
            Swal.fire({
              position: "center",
              icon: "warning",
              title: "Product is Shipped",
              showConfirmButton: false,
              timer: 2000,
            })
          }else if(response.Delivered){
            Swal.fire({
              position: "center",
              icon: "warning",
              title: "Product is Delivered",
              showConfirmButton: false,
              timer: 2000,
            })
          }else if(response.Cancelled){
            Swal.fire({
              position: "center",
              icon: "warning",
              title: "Product is Cancelled",
              showConfirmButton: false,
              timer: 2000,
            })
          }else if(response.DateExed){
            Swal.fire({
              position: "center",
              icon: "warning",
              title: "Return Date is Exceed",
              showConfirmButton: false,
              timer: 2000,
            })
          }
        },
      });
    }
  });
}

function deliveryStatus(value, orderId) {
  Swal.fire({
    title: "Are you sure want to Change the Order status",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/deleveryStatusUpdate",
        data: {
          status: value,
          orderId: orderId,
        },
        method: "post",
        success: (response) => {
          if (response) {
            Swal.fire("success", "Status Updated .", "success");
            location.reload()
          }
        },
      });
    }
  });
}


// Remove Banner
function deleteBanner(id) {
  console.log(id);
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, remove it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/delete-banner",
        data: {
          bannerId: id,
        },
        method: "post",
        success: (response) => {
          if (response.bannerRemoved) {
            Swal.fire(
              "Deleted!",
              "Banner has been deleted.",
              "success"
            ).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }
        },
      });
    }
  });

}


// Desable Banner
function desableBanner(id) {
  console.log(id);
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/desable-banner",
        data: {
          bannerId: id,
        },
        method: "post",
        success: (response) => {
          if (response.bannerDesabled) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "",
              showConfirmButton: false,
              timer: 900,
            }).then(() => {
              location.reload()
            })

          }
        },
      });
    }
  });

}

// Wishlist

function addToWishList(proId) {
  $.ajax({
    url: "/add-to-wishlist/" + proId,
    method: "post",
    success: (response) => {
      console.log(response);
      if (response.status === true) {
        let count = $("#wishlist-count").html();
        count = parseInt(count) + 1;
        $("#wishlist-count").html(count);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Added to wishlist',
          showConfirmButton: false,
          timer: 850
        })
      } else if (response.status === 'exist') {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Product already exist',
          showConfirmButton: false,
          timer: 800
        })
      }
      else {
        window.location.href = "/user-login";
      }
    },
  });
}

// Coupon

$("#couponValidate").submit((e) => {
  e.preventDefault();
  if (validateCoupon(true)) {
    $.ajax({
      url: "/validate-coupon",
      method: "post",
      data: $("#couponValidate").serialize(),
      success: (response) => {
        if (response.status) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Coupon added",
            showConfirmButton: false,
            timer: 1000,
          }).then(()=>{
          location.reload()
          })
        }else if(response.usedCoupon){
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'coupon used!',
          })
        }
        else{
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'wrong! coupon code',
          })
        }
      },
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please give the required",
    });
  }
});

function removeCoupon(code){
  $.ajax({
    url: "/remove-coupon",
    data:{
      couponCode : code
    },
    method: "post",
    success: (response) => {
      location.reload()
    }
  })
}

function deleteCoupon(iD){
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/remove-coupon",
        data: {
          id:iD
        },
        method: "post",
        success: (response) => {
          location.reload()
        },
      });
    }
  });
}

function referralGenerate(){
  $.ajax({
    url:"/referral",
    method:'post',
    success:(response)=>{
      let referral =document.getElementById('copyText')
      referral.value="http://itsmevizz/user-signUp?referral="+response
    }
  })
}

function deleteCategoryOffer(iD,nme){
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/remove-cateOffer",
        data: {
          id:iD,
          name:nme
        },
        method: "post",
        success: (response) => {
          location.reload()
        },
      });
    }
  });
}


function removeFromWishList(ProId) {
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/remove-wishlist",
        data: {
          product: ProId,
        },
        method: "post",
        success: (response) => {
          if (response.removeProduct) {
            Swal.fire(
              "Deleted!",
              "Your product has been deleted.",
              "success"
            ).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }
        },
      });
    }
  });
}

function blockUser(userId, Name) {
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Block ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/Block-user",
        data: {
          id: userId,
        },
        method: "post",
        success: (response) => {
          if (response.blocked) {
                location.reload();
          }else{
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Somthing Wrong!',
            })
          }
        },
      });
    }
  });
}


function unblockUser(userId, Name) {
  Swal.fire({
    title: "Are you sure?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Unblock ",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/Unblock-user",
        data: {
          id: userId,
        },
        method: "post",
        success: (response) => {
          if (response.unblocked) {
                location.reload();
          }else{
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Somthing Wrong!',
            })
          }
        },
      });
    }
  });
}

