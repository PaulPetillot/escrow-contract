export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
  isApproved
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} </div>
        </li>
        {!isApproved ? (
          <div
            className="button"
            id={address}
            onClick={(e) => {
              e.preventDefault();

              handleApprove();
            }}
          >
            Approve
          </div>
        ) : (
          <div> Approved </div>
        )}
      </ul>
    </div>
  );
}
