import "../styles/genre-radio.css";

export default function GenreRadioGroup({ genres, value, onChange }) {
    return (
        <div className="radio-grid">
            {genres.map((g, index) => (
                <label key={index} className="label">
                    <input
                        type="radio"
                        name="genre-radio"
                        value={g}
                        checked={value === g}
                        onChange={() => onChange(g)}
                    />
                    <p className="text">{g}</p>
                </label>
            ))}

            {/* Allow "All Genres" option */}
            <label className="label">
                <input
                    type="radio"
                    name="genre-radio"
                    value=""
                    checked={value === ""}
                    onChange={() => onChange("")}
                />
                <p className="text">All Genres</p>
            </label>
        </div>
    );
}