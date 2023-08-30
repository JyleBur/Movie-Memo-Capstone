import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { useAuth } from '../../utils/context/authContext';
import { getPlaylists } from '../../utils/data/playlistData';
import { createMovie, updateMovie } from '../../utils/data/movieData';
import { getMovieById } from '../../utils/data/themoviedb';

const initialState = {
  apiID: '',
  watchlist: false,
  favorite: false,
  watched: false,
};

function MovieForm({ obj }) {
  /* isWatchlist, isFavorite, isWatched */

  const [formInput, setFormInput] = useState(initialState);
  const [playlist, setPlaylist] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  useEffect(() => {
    getPlaylists(user.uid).then(setPlaylist);
    if (id) {
      getMovieById(id).then(setMovieDetails);
    }

    if (obj.firebaseKey) setFormInput(obj);
  }, [obj, user, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (obj.firebaseKey) {
      updateMovie(formInput).then(() => router.push(`/movie/${obj.firebaseKey}`));
    } else {
      const payload = { ...formInput, uid: user.uid, apiID: id };
      createMovie(payload).then(({ name }) => {
        const patchPayload = { firebaseKey: name };
        updateMovie(patchPayload).then(() => {
          router.push('/'); // TODO: UPDATE THIS LATER
        });
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2 className="text-white mt-5">{obj.firebaseKey ? 'Update' : 'Create'} Movie</h2>

      <h1>Add {movieDetails.title}</h1>

      <Form.Check
        className="text-white mb-3"
        type="switch"
        id="watchlist"
        name="watchlist"
        label="Watchlist"
        checked={formInput.watchlist}
        onChange={(e) => {
          setFormInput((prevState) => ({
            ...prevState,
            watchlist: e.target.checked,
          }));
        }}
      />

      <Form.Check
        className="text-white mb-3"
        type="switch"
        id="favorite"
        name="favorite"
        label="Favorite"
        checked={formInput.favorite}
        onChange={(e) => {
          setFormInput((prevState) => ({
            ...prevState,
            favorite: e.target.checked,
          }));
        }}
      />

      <Form.Check
        className="text-white mb-3"
        type="switch"
        id="watched"
        name="watched"
        label="Watched"
        checked={formInput.watched}
        onChange={(e) => {
          setFormInput((prevState) => ({
            ...prevState,
            watched: e.target.checked,
          }));
        }}
      />

      <FloatingLabel controlId="floatingSelect" label="Playlist">
        <Form.Select
          aria-label="Playlist"
          name="playlistID"
          onChange={handleChange}
          className="mb-3"
          value={obj.firebaseKey} // FIXME: modify code to remove error
          required
        >
          <option value="">Select an Playlist</option>
          {playlist.map((playlists) => (
            <option key={playlists.firebaseKey} value={playlists.firebaseKey}>
              {playlists.title}
            </option>
          ))}
        </Form.Select>
      </FloatingLabel>

      {/* SUBMIT BUTTON  */}
      <Button type="submit">{obj.firebaseKey ? 'Update' : 'Add'} Movie to Playlist </Button>
    </Form>
  );
}

MovieForm.propTypes = {
  obj: PropTypes.shape({
    isWatchlist: PropTypes.bool,
    isFavorite: PropTypes.bool,
    isWatched: PropTypes.bool,
    apiID: PropTypes.string,
    firebaseKey: PropTypes.string,
  }),
};

MovieForm.defaultProps = {
  obj: initialState,
};

export default MovieForm;
