// Form submission handling
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: form.name.value,
                email: form.email.value,
                phone: form.phone.value,
                message: form.message.value
            };

            try {
                // Here you would typically send the data to your backend
                // For now, we'll just log it and show a success message
                console.log('Form submitted:', formData);
                
                // Show success message
                alert('Thank you for joining our sports community! We will contact you soon.');
                
                // Reset form
                form.reset();
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('There was an error submitting the form. Please try again.');
            }
        });
    }

    // Menu filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    const observerOptions = {
        threshold: 0.2
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const category = button.dataset.category;

            menuItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Cart functionality
    const cart = [];
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    const orderButtons = document.querySelectorAll('.order-btn');

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-details">
                    <span>${item.name}</span>
                    <span>₱${item.price}</span>
                </div>
                <button class="remove-item" data-index="${index}">×</button>
            `;
            cartItems.appendChild(cartItem);
            total += item.price;
        });

        totalAmount.textContent = `₱${total}`;
    }

    orderButtons.forEach(button => {
        button.addEventListener('click', () => {
            const menuItem = button.closest('.menu-item');
            const name = menuItem.querySelector('h3').textContent;
            const price = parseInt(menuItem.querySelector('.price').textContent.replace('₱', ''));

            cart.push({ name, price });
            updateCart();

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Added to cart!';
            menuItem.appendChild(successMessage);

            setTimeout(() => {
                successMessage.remove();
            }, 2000);
        });
    });

    // Remove items from cart
    cartItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            updateCart();
        }
    });

    // Order form submission
    const orderForm = document.getElementById('order-form');
    
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert('Please add items to your cart before placing an order.');
                return;
            }

            const formData = {
                name: orderForm.name.value,
                phone: orderForm.phone.value,
                pickupTime: orderForm['pickup-time'].value,
                notes: orderForm.notes.value,
                items: cart.map(item => ({
                    name: item.name,
                    quantity: 1,
                    price: item.price
                })),
                total: cart.reduce((sum, item) => sum + item.price, 0)
            };

            try {
                const response = await fetch('api/process_order.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Thank you for your order! We will prepare your drinks for pickup.');
                    orderForm.reset();
                    cart.length = 0;
                    updateCart();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Error submitting order:', error);
                alert('There was an error processing your order. Please try again.');
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to navigation links on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Add animation to menu items
    menuItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(item);
    });

    // Add scrollToOrder function to global scope
    window.scrollToOrder = function() {
        const orderSection = document.getElementById('contact');
        if (orderSection) {
            orderSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Add animation to testimonials
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    // Video Background Fallback
    const video = document.querySelector('.hero-video');
    const heroImage = document.querySelector('.hero-image');

    if (video) {
        video.addEventListener('error', () => {
            // If video fails to load, show the image background
            video.style.display = 'none';
            heroImage.style.display = 'block';
        });

        // Check if video is actually playing
        video.addEventListener('playing', () => {
            video.style.display = 'block';
            heroImage.style.display = 'none';
        });
    }
});

// Hamburger Menu Functionality
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Scroll to Menu Function
function scrollToMenu() {
    const menuSection = document.getElementById('menu');
    menuSection.scrollIntoView({ behavior: 'smooth' });
} 