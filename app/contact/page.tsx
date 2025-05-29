export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-base-200 text-base-content">
      <div className="card w-96 bg-base-100 shadow-xl p-8 text-center">
        <h1 className="text-5xl font-bold text-secondary mb-4">
          Contact Us
        </h1>
        <p className="text-lg mb-6">
          Feel free to reach out to us with any questions!
        </p>
        <form className="form-control gap-4">
          <input type="text" placeholder="Your Name" className="input input-bordered" />
          <input type="email" placeholder="Your Email" className="input input-bordered" />
          <textarea placeholder="Your Message" className="textarea textarea-bordered h-24"></textarea>
          <button type="submit" className="btn btn-secondary">Send Message</button>
        </form>
      </div>
    </main>
  );
}
