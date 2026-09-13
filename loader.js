// This runs automatically when the page loads
async function loadComponents() {

  try {

    // Load header
    const headerRes = await fetch('header.html');
    if (headerRes.ok) {

      document.getElementById('header-placeholder').innerHTML = await headerRes.text();

    }

    // Load footer
    const footerRes = await fetch('footer.html');
    if (footerRes.ok) {

      document.getElementById('footer-placeholder').innerHTML = await footerRes.text();
      
    }
    
  } catch (error) {

    // Silent fail for mockups - you'll see the error in browser console if something breaks
    console.log('Error loading components:', error);

  }

}

// Execute when DOM is ready
if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', loadComponents);

} else {

  loadComponents();

}